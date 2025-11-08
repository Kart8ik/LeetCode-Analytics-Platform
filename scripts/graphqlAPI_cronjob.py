import os
from dotenv import load_dotenv
import time
import json
import requests
from typing import Any, Dict, List, Optional
from supabase import create_client, Client


load_dotenv()

URL = "https://leetcode.com/graphql"
HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0",
}

LEETCODE_SESSION = os.environ.get("LEETCODE_SESSION")
if LEETCODE_SESSION:
    HEADERS["Cookie"] = f"LEETCODE_SESSION={LEETCODE_SESSION}"

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

REQUEST_DELAY = 0.4
MAX_RETRIES = 3

# --- Queries ---

# --- Main combined query (covers most data) ---
Q_fullUserData = """
query fullUserData($username: String!, $limit: Int!, $year: Int) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
    }
    badges {
      id
      name
      category
      creationDate
      icon
    }
    languageProblemCount {
      languageName
      problemsSolved
    }
    tagProblemCounts {
      advanced { tagName problemsSolved }
      intermediate { tagName problemsSolved }
      fundamental { tagName problemsSolved }
    }
    submitStats {
      acSubmissionNum { difficulty count submissions }
      totalSubmissionNum { difficulty count submissions }
    }
    userCalendar(year: $year) {
      streak
      totalActiveDays
      submissionCalendar
    }
  }
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
  }
}
"""

# --- Minimal fallback queries ---
Q_userPublicProfile = """
query userPublicProfile($username: String!) {
  matchedUser(username: $username) {
    profile {
      realName
      userAvatar
      ranking
    }
  }
}
"""

Q_userSessionProgress = """
query userSessionProgress($username: String!) {
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum { difficulty count submissions }
      totalSubmissionNum { difficulty count submissions }
    }
  }
}
"""

Q_skillStats = """
query skillStats($username: String!) {
  matchedUser(username: $username) {
    tagProblemCounts {
      advanced { tagName problemsSolved }
      intermediate { tagName problemsSolved }
      fundamental { tagName problemsSolved }
    }
  }
}
"""

Q_languageStats = """
query languageStats($username: String!) {
  matchedUser(username: $username) {
    languageProblemCount {
      languageName
      problemsSolved
    }
  }
}
"""

Q_userBadges = """
query userBadges($username: String!) {
  matchedUser(username: $username) {
    badges { id name category creationDate icon }
  }
}
"""

Q_userProfileCalendar = """
query userProfileCalendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      streak
      totalActiveDays
      submissionCalendar
    }
  }
}
"""

def graphql_request(query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    payload = {"query": query, "variables": variables or {}}
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.post(URL, json=payload, headers=HEADERS, timeout=20)
            if r.status_code == 200:
                return r.json()
            print(f"[WARN] HTTP {r.status_code}: {r.text[:200]}")
        except Exception as e:
            print("[WARN] request error:", e)
        time.sleep(0.6 + 0.3 * attempt)
    return {}

def get_count_by_label(arr: Optional[List[Dict[str, Any]]], label: str) -> int:
    if not arr:
        return 0
    label = label.lower()
    for item in arr:
        d = (item.get("difficulty") or "").lower()
        if label == "all" and (d == "all" or d == ""):
            return int(item.get("count") or item.get("submissions") or 0)
        if label in d:
            return int(item.get("count") or item.get("submissions") or 0)
    if label == "all":
        return sum(int(i.get("count") or i.get("submissions") or 0) for i in arr)
    return 0

def safe_json_dumps(obj: Any) -> str:
    try:
        return json.dumps(obj, ensure_ascii=False)
    except Exception:
        return json.dumps(str(obj))

def upsert_to_supabase(user_id: str, row: Dict[str, Any]):
    """Push data into all tables for one user."""
    # users
    supabase.table("users").update({
        "user_url": row.get("user_url"),
        "global_rank": row.get("rank"),
        "updated_at": "now()"
    }).eq("user_id", user_id).execute()

    # problem_stats
    supabase.table("problem_stats").upsert({
        "user_id": user_id,
        "easy_solved": row.get("easy_solved"),
        "medium_solved": row.get("medium_solved"),
        "hard_solved": row.get("hard_solved"),
        "acceptance_rate": row.get("acceptance_rate_percent"),
        "total_solved": row.get("total_solved")
    }).execute()

    # progress_stats
    supabase.table("progress_stats").upsert({
        "user_id": user_id,
        "streak_count": row.get("streak_count"),
        "badge_count": row.get("badge_count"),
        "submission_calendar_json": row.get("submission_calendar_json"),
        "recent_submissions": row.get("recent_submissions_json"),
        "total_active_days": row.get("total_active_days")
    }).execute()

    # language_stats
    try:
        langs = json.loads(row.get("language_stats_json") or "[]")
        for l in langs:
            supabase.table("language_stats").upsert({
                "user_id": user_id,
                "language_name": l["languageName"],
                "problems_solved": l["problemsSolved"]
            }).execute()
    except Exception as e:
        print(f"[WARN] language_stats failed for {user_id}: {e}")

    # topic_stats
    try:
        topics = json.loads(row.get("topic_stats_json") or "[]")
        for t in topics:
            supabase.table("topic_stats").upsert({
                "user_id": user_id,
                "tag_name": t["tag_name"],
                "difficulty_level": t["difficulty_level"],
                "problems_solved": t["problems_solved"]
            }).execute()
    except Exception as e:
        print(f"[WARN] topic_stats failed for {user_id}: {e}")


def fetch_and_push():
    # Get users from Supabase
    res = supabase.table("users").select("user_id, username").execute()
    if not res.data:
        print("No users found in Supabase.")
        return
    users = res.data

    print(f"Fetched {len(users)} users from Supabase.\n")

    # Loop through users
    for u in users:
        user_id, uname = u["user_id"], u["username"]
        print(f"Fetching: {uname}")
        row = {"username": uname}
        try:
            res = graphql_request(Q_fullUserData, {"username": uname, "limit": 15, "year": None})
            data = res.get("data", {})
            user = data.get("matchedUser")

            if not user:
                print(f"[WARN] Full query failed for {uname}, skipping user.")
                continue

            # Parse all the same as your existing code
            prof = user.get("profile") or {}
            row["real_name"] = prof.get("realName")
            row["user_url"] = prof.get("userAvatar")
            row["rank"] = prof.get("ranking")

            submit = user.get("submitStats") or {}
            ac = submit.get("acSubmissionNum") or []
            tot = submit.get("totalSubmissionNum") or []
            row["easy_solved"] = get_count_by_label(ac, "easy")
            row["medium_solved"] = get_count_by_label(ac, "medium")
            row["hard_solved"] = get_count_by_label(ac, "hard")
            total_ac = get_count_by_label(ac, "all")
            total_total = get_count_by_label(tot, "all")
            row["total_solved"] = total_ac
            row["acceptance_rate_percent"] = (
                round((total_ac / total_total) * 100.0, 2) if total_total else None
            )

            langs = user.get("languageProblemCount") or []
            row["language_stats_json"] = safe_json_dumps(langs)

            tags = user.get("tagProblemCounts") or {}
            topics = []
            for lvl in ("advanced", "intermediate", "fundamental"):
                for it in tags.get(lvl) or []:
                    topics.append({
                        "tag_name": it.get("tagName"),
                        "difficulty_level": lvl,
                        "problems_solved": int(it.get("problemsSolved") or 0)
                    })
            row["topic_stats_json"] = safe_json_dumps(topics)

            badges = user.get("badges") or []
            row["badge_count"] = len(badges)

            cal = user.get("userCalendar") or {}
            row["streak_count"] = cal.get("streak")
            row["total_active_days"] = cal.get("totalActiveDays")
            row["submission_calendar_json"] = safe_json_dumps(cal.get("submissionCalendar"))

            row["recent_submissions_json"] = safe_json_dumps(
                data.get("recentAcSubmissionList") or []
            )

            # Push to Supabase
            upsert_to_supabase(user_id, row)
            print(f"✅ Synced {uname} successfully.\n")

        except Exception as e:
            print(f"[ERROR] Failed for {uname}: {e}")

        time.sleep(REQUEST_DELAY)

    print("All users processed successfully.")

if __name__ == "__main__":
    fetch_and_push()
