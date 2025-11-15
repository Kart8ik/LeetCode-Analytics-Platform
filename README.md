# LeetTrack &mdash; LeetCode Analysis Platform

![CI](https://github.com/pestechnology/PESU_EC_CSE_A_P73_API_Rate_Limiter_Agile-PipeDream/actions/workflows/ci.yml/badge.svg)

LeetTrack is a Supabase-backed web application that helps PES University students visualise their LeetCode activity, compare progress with classmates, and keep their practice streaks on track. The platform combines a Vite + React (TypeScript) front-end with a Python ingestion job that syncs real LeetCode profiles into Supabase on a schedule.

> **Project metadata**  
> UE23CS341A &middot; Semester 5 &middot; PES University EC Campus  
> Team Agile PipeDream &middot; Project ID P73

---

- [Key Features](#key-features)
- [System Overview](#system-overview)
- [Getting Started](#getting-started)
- [Supabase Configuration](#supabase-configuration)
- [Data Sync Job (LeetCode → Supabase)](#data-sync-job-leetcode--supabase)
- [Available npm Scripts](#available-npm-scripts)
- [Testing & Quality Gates](#testing--quality-gates)
- [Project Structure](#project-structure)
- [Team](#team)
- [License](#license)

## Key Features

- **Secure authentication** — Supabase email/password auth with role resolution and persisted user metadata.
- **Dark & light themes** — Theme state synced to `localStorage` and system preferences, exposed via the global auth context.
- **Dashboard insights** — Per-user problem stats, streak metrics, contribution calendar heat map, language/topic breakdowns, plus a copyable AI prompt that summarises the profile.
- **Leaderboard** — Search, filter, and sort classmates by global rank, totals, streaks, section, and semester. Admins can export the current view as CSV with one click.
- **Automated data ingestion** — A Python script (`scripts/graphqlAPI_cronjob.py`) calls LeetCode’s GraphQL API, normalises the response, and upserts into Supabase tables. A GitHub Actions workflow (`leetcode_dummy_cron.yml`) runs it every two hours.
- **Modern UI toolkit** — Built with React 19, React Router, Tailwind, Shadcn UI primitives, Lucide icons, and Recharts for elegant, accessible visuals.
- **Observability & UX** — Toast notifications (`sonner`) for success/error feedback, skeleton states, and optimistic UI hints throughout.
- **Strong testing culture** — Vitest-based unit, integration, and system tests (disabled for deployment pushes by `.gitignore`, but kept locally for maintainers).
- **CI pipeline** — A single GitHub Actions workflow (`ci.yml`) installs dependencies, runs the Vitest suite with coverage, enforces thresholds, produces a JSON lint report, audits dependencies, and uploads artefacts.

## System Overview

| Layer                     | Technology / Responsibility                                                                                                           |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| **Frontend**              | Vite + React + TypeScript. Handles routing (`react-router-dom`), auth context, dashboards, leaderboard UI, and theming.              |
| **Backend (BaaS)**        | Supabase. Stores user metadata, problem stats, progress stats, language/topic stats, and exposes RPCs (`get_user_details`, `get_leaderboard_json`). |
| **Data ingestion**        | Python 3 (`scripts/graphqlAPI_cronjob.py`). Fetches live data from LeetCode GraphQL, upserts to Supabase tables, retries gracefully, and respects rate limits. |
| **Automation**            | GitHub Actions (`ci.yml`, `leetcode_dummy_cron.yml`). Runs quality gates on every push/PR and schedules the sync job every 2 hours (plus manual dispatch). |

## Getting Started

### Prerequisites

- Node.js **20.19.0** (or newer 20.x release) and npm 10+
- Python **3.11+** (for the ingestion job)
- Supabase project with REST and RPC access
- (Optional) `LEETCODE_SESSION` cookie value if you need higher LeetCode rate limits

### 1. Clone the repository
```bash
git clone https://github.com/pestechnology/PESU_EC_CSE_A_P73_API_Rate_Limiter_Agile-PipeDream.git
cd PESU_EC_CSE_A_P73_API_Rate_Limiter_Agile-PipeDream
```

### 2. Configure environment variables

Copy `.env.example` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

| Variable               | Description                                           |
|------------------------|-------------------------------------------------------|
| `VITE_SUPABASE_URL`    | Supabase project URL (found under Project Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public API key                            |

> These variables are consumed by `src/lib/supabase.ts` when the Vite dev server starts.

### 3. Install dependencies & run the app
```bash
npm install          # install JS/TS dependencies
npm run dev          # start Vite on http://localhost:5173
```

The app hot-reloads as you edit files in `src/`. Vite proxies API calls directly to Supabase using the configured env vars.

## Supabase Configuration

1. **Tables (minimum viable schema)**  
   The ingestion script expects the following tables (all keyed by `user_id` / UUID). Column names are inferred from the script:

   - `users`: `user_id (uuid)`, `username`, `real_name`, `section`, `semester`, `user_url`, `global_rank`, timestamps.
   - `problem_stats`: `user_id`, `easy_solved`, `medium_solved`, `hard_solved`, `total_solved`, `acceptance_rate`.
   - `progress_stats`: `user_id`, `streak_count`, `total_active_days`, `submission_calendar_json` (text), `recent_submissions` (json/text), `badge_count`.
   - `language_stats`: `user_id`, `language_name`, `problems_solved`.
   - `topic_stats`: `user_id`, `tag_name`, `difficulty_level`, `problems_solved`.

   Ensure foreign keys from the child tables to `users.user_id` for referential integrity.

2. **RPC functions**  
   - `get_user_details(user_id uuid)` — should return a JSON aggregate with `problem_stats`, `progress_stats`, `topic_stats`, and `language_stats` for a single user. The Dashboard parses this payload directly.
   - `get_leaderboard_json()` — should return an array of users with rank, streak, totals, section, and semester fields. The Leaderboard page uses it to populate the table.

3. **Authentication**  
   - Enable email/password auth in Supabase Auth settings.
   - Ensure the `users` table syncs metadata (username, section, semester) via signup or via manual admin entry.

4. **Row-Level Security (RLS)**  
   - Configure RLS policies so authenticated users can read their own stats and the public leaderboard, while only service-role keys (used by the cron job) can upsert data.

## Data Sync Job (LeetCode → Supabase)

The ingestion routine lives in `scripts/graphqlAPI_cronjob.py`. It:

1. Fetches the list of active users from the Supabase `users` table.
2. Queries LeetCode’s GraphQL API (`/graphql`) for each user:
   - Tries a full query first; falls back to modular queries if the full one fails.
   - Respects rate limits with exponential back-off and `REQUEST_DELAY`.
3. Normalises the response (problem counts, badge counts, language/topic stats, contribution calendar, recent submissions).
4. Upserts the data into Supabase tables via the service key.

### Local run
```bash
cd scripts
python -m venv .venv
source .venv/bin/activate        # `.venv\Scripts\activate` on Windows
pip install -r requirements.txt

export SUPABASE_URL="https://xyz.supabase.co"
export SUPABASE_SERVICE_KEY="service-role-key"
# Optional but improves rate limits:
export LEETCODE_SESSION="your_cookie_value"

python graphqlAPI_cronjob.py
```

### Scheduled run
The GitHub Actions workflow `.github/workflows/leetcode_dummy_cron.yml` runs the script every 2 hours (`cron: "0 */2 * * *"`) using repository secrets:

| Secret name             | Purpose                                  |
|-------------------------|------------------------------------------|
| `SUPABASE_URL`          | Supabase project URL                      |
| `SUPABASE_SERVICE_KEY`  | Supabase service-role key                 |
| `LEETCODE_SESSION`      | *(optional)* cookie for authenticated requests |

## Available npm Scripts

```bash
npm run dev              # Start Vite dev server
npm run build            # Type-check and create a production build
npm run preview          # Preview the production build locally

npm run test             # Alias for `vitest run --coverage`
npm run test:coverage    # Same as above (kept for CI compatibility)
npm run test:unit        # Run only unit tests
npm run test:integration # Run integration tests
npm run test:system      # Run system-level tests

npm run lint             # Lint application source (src/**)
npm run lint:ci          # Lint and output JSON report (used in CI)
npm run audit:ci         # Generate npm audit JSON (non-blocking)
npm run check-coverage   # Ensure coverage ≥ 80% (used in CI)
```

> **Note:** The `tests/` directory is ignored by Git for production pushes (see `.gitignore`) but remains part of the local workspace so contributors can run the Vitest suite.

## Testing & Quality Gates

- **Vitest + Testing Library** cover components, hooks, LeetCode parsing logic, and key pages. Run locally with `npm run test:unit`, `npm run test:integration`, and `npm run test:system` as needed.
- **Coverage enforcement** — `npm run check-coverage` fails if global coverage drops below 80%.
- **ESLint** — `npm run lint` (developer workflow) and `npm run lint:ci` (CI JSON report).
- **Security audit** — `npm run audit:ci` (non-blocking) combined with `node scripts/check-security.cjs`, which fails the pipeline if high/critical vulnerabilities exist.
- **CI workflow** — `.github/workflows/ci.yml` orchestrates the above steps on pushes/PRs to `main`, `develop`, and `feature/**` branches.

## Project Structure

```
.
├── src/
│   ├── App.tsx                  # Routing + protected routes
│   ├── pages/                   # Dashboard, Leaderboard, Login, SignUp
│   ├── components/              # UI primitives (Shadcn), navbars, charts
│   ├── context/AuthContext.tsx  # Supabase auth + theme context
│   ├── lib/supabase.ts          # Supabase client initialisation
│   └── assets/                  # Static assets (logos, background images)
├── scripts/
│   ├── graphqlAPI_cronjob.py    # LeetCode → Supabase sync job
│   └── requirements.txt         # Python dependencies for the job
├── tests/                       # Vitest suites (unit, integration, system)
├── .github/workflows/           # ci.yml (quality gates), leetcode_dummy_cron.yml (sync)
├── .env.example                 # Frontend environment template
├── package.json                 # npm scripts & dependencies
├── vite.config.ts               # Vite + Tailwind configuration
└── README.md                    # You are here
```

## Team

- [@Kart8ik](https://github.com/Kart8ik) — Scrum Master  
- [@aayanvikramsingh](https://github.com/aayanvikramsingh) — Developer  
- [@adma77ya](https://github.com/adma77ya) — Developer  
- [@ABHISHEK-S-NAIR](https://github.com/ABHISHEK-S-NAIR) — Developer  

## License

This project is developed for educational purposes as part of PES University’s UE23CS341A curriculum (Academic Year 2025, Semester 5, Section A). Feel free to reference or adapt the code for learning and internal coursework.
