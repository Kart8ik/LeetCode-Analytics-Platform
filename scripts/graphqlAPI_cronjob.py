import os
from pathlib import Path
from dotenv import load_dotenv
import time
import json
import requests
import re
from typing import Any, Dict, List, Optional
from supabase import create_client, Client

_SCRIPT_DIR = Path(__file__).resolve().parent
load_dotenv(_SCRIPT_DIR / ".env")

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
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

REQUEST_DELAY = 0.6
MAX_RETRIES = 3
USERNAME_REGEX = r"^[a-zA-Z0-9_]{3,24}$"

# ------------------ QUERIES ------------------

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

# ------------------ HELPERS ------------------

def graphql_request(query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    payload = {"query": query, "variables": variables or {}}

    for attempt in range(MAX_RETRIES):
        try:
            r = requests.post(URL, json=payload, headers=HEADERS, timeout=20)
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass

        time.sleep(0.8 + 0.4 * attempt)

    return {}

def get_count(arr, label):
    if not arr:
        return 0

    label = label.lower()

    for i in arr:
        d = (i.get("difficulty") or "").lower()
        if label in d:
            return int(i.get("count") or i.get("submissions") or 0)

    if label == "all":
        return sum(int(i.get("count") or i.get("submissions") or 0) for i in arr)

    return 0

def safe_json(obj):
    try:
        return json.dumps(obj, ensure_ascii=False)
    except:
        return "[]"

# ------------------ MAIN ------------------

def fetch_and_push():
    res = (
        supabase
        .table("users")
        .select("user_id, username")
        .not_.is_("username", "null")
        .execute()
    )

    users = res.data or []
    print(f"Fetched {len(users)} users\n")

    for u in users:
        user_id = u["user_id"]
        uname = (u.get("username") or "").strip()

        # -------- SKIP INVALID --------
        if not uname:
            print(f"[SKIP] Empty username: {user_id}")
            continue

        if not re.match(USERNAME_REGEX, uname):
            print(f"[SKIP] Invalid username: {uname}")
            continue

        print(f"[FETCH] {uname}")

        try:
            # -------- FULL QUERY --------
            res = graphql_request(Q_fullUserData, {
                "username": uname,
                "limit": 15,
                "year": None
            })

            data = res.get("data", {})
            user = data.get("matchedUser")

            # -------- FALLBACK --------
            if not user:
                print(f"[WARN] Full query failed → fallback for {uname}")

                user = {}

                for query in [
                    Q_userPublicProfile,
                    Q_userSessionProgress,
                    Q_skillStats,
                    Q_languageStats,
                    Q_userBadges,
                    Q_userProfileCalendar
                ]:
                    partial = graphql_request(query, {"username": uname})
                    matched = partial.get("data", {}).get("matchedUser")

                    if matched:
                        user.update(matched)

                    time.sleep(0.25)

                data["recentAcSubmissionList"] = []

            if not user:
                print(f"[SKIP] No valid data for {uname}\n")
                continue

            # -------- PARSE --------
            prof = user.get("profile") or {}
            submit = user.get("submitStats") or {}

            ac = submit.get("acSubmissionNum") or []
            tot = submit.get("totalSubmissionNum") or []

            total_ac = get_count(ac, "all")
            total_total = get_count(tot, "all")

            # -------- USERS UPDATE --------
            if prof.get("ranking") is not None:
                supabase.table("users").update({
                    "global_rank": prof.get("ranking")
                }).eq("user_id", user_id).execute()

            # -------- PROBLEM STATS --------
            supabase.table("problem_stats").upsert({
                "user_id": user_id,
                "easy_solved": get_count(ac, "easy"),
                "medium_solved": get_count(ac, "medium"),
                "hard_solved": get_count(ac, "hard"),
                "total_solved": total_ac,
                "acceptance_rate": (
                    round((total_ac / total_total) * 100, 2)
                    if total_total else None
                )
            }).execute()

            # -------- PROGRESS --------
            cal = user.get("userCalendar") or {}

            supabase.table("progress_stats").upsert({
                "user_id": user_id,
                "streak_count": cal.get("streak"),
                "total_active_days": cal.get("totalActiveDays"),
                "submission_calendar_json": safe_json(cal.get("submissionCalendar")),
                "badge_count": len(user.get("badges") or []),
                "recent_submissions": safe_json(data.get("recentAcSubmissionList"))
            }).execute()

            # -------- LANGUAGE (BATCH) --------
            langs = user.get("languageProblemCount") or []

            if langs:
                supabase.table("language_stats").upsert([
                    {
                        "user_id": user_id,
                        "language_name": l["languageName"],
                        "problems_solved": l["problemsSolved"]
                    }
                    for l in langs
                ]).execute()

            # -------- TOPICS (BATCH) --------
            topics = []

            for lvl in ("advanced", "intermediate", "fundamental"):
                for t in (user.get("tagProblemCounts") or {}).get(lvl) or []:
                    topics.append({
                        "user_id": user_id,
                        "tag_name": t["tagName"],
                        "difficulty_level": lvl,
                        "problems_solved": t["problemsSolved"]
                    })

            if topics:
                supabase.table("topic_stats").upsert(topics).execute()

            print(f"[DONE] {uname}\n")

        except Exception as e:
            print(f"[ERROR] {uname}: {e}")

        time.sleep(REQUEST_DELAY)

    print("All users synced.")

if __name__ == "__main__":
    fetch_and_push()