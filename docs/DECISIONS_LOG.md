# Decisions Log

A running record of what we worked on each session, decisions made (and why),
problems hit and how they were resolved, and what's next. Newest entry at the
bottom. This is separate from git commit history, which shows *what* changed but
not *why*, or what alternatives were considered and rejected.

---

## 2026-08-22 — Planning, research, and repo scaffolding

**Worked on:** Reviewed the original 7-phase roadmap for Coffee Shot Intelligence,
built a reordered/trimmed build plan, checked it against two outside videos on
AI-assisted developer workflows, then started executing step 1 (repo hygiene).

**Decisions:**
- MVP scope = trimmed Phases 1–3 + a simple deploy step (no Kubernetes/GitOps).
  Phases 5–7 (observability, IoT, AI) demoted to a stretch list — pick at most one,
  after the MVP is live.
- CI (GitHub Actions) gets set up in step 2, on a trivial health-check endpoint,
  before any real feature — not deferred to "Phase 3" as originally written.
- Alembic migrations added as an explicit step (missing from the original plan).
- Tests are written alongside each feature slice, in the same PR — not deferred to
  a separate testing phase.
- Added `docs/CONTEXT.md` as a living domain glossary, after reviewing Matt
  Pocock's `skills` AI-coding-workflow framework, which recommends a shared-language
  doc to keep naming consistent between the codebase and any AI assistant working on
  it.
- Chose implement-then-test (same PR) over strict TDD, to preserve pace on a
  weeks-long timeline.
- Kept a single running decisions log (this file) instead of one file per decision
  (ADR-style) — simpler for a solo, timeline-boxed project.
- Data model: standardized on `rating` (not `taste`) on `Shot`, and added a new
  `grind_time` field, distinct from `duration` (total extraction time). See
  `docs/CONTEXT.md` for the full reasoning.
- Commit cadence: small, atomic commits per logical change within a step; one PR
  per numbered step/slice; the very first commit (this scaffolding) goes straight to
  `main`, before branch protection is turned on, since there's nothing to branch for
  yet.
- Working style: manual approval per edit, explanations before writing new files,
  no batching multiple roadmap steps into one unreviewed sweep.

**Problems encountered:** None yet — this was planning plus initial scaffolding.

**Next:** Finish step 1 — `docs/CONTEXT.md`, first commit to `main`, push to a
GitHub remote, enable branch protection requiring PRs (and, once it exists, the CI
check).

---

## 2026-08-23 — Local Postgres, a Docker/virtualization detour, and a missed-commit bug

**Worked on:** Step 3 (local Postgres). Hit a real blocker getting there: Docker
Desktop failed with "virtualization support not detected." Since this is a work
machine, paused to consider whether to touch BIOS settings at all.

**Problems encountered and how they were resolved:**
- Docker Desktop wouldn't start — root cause was hardware virtualization disabled
  in the machine's firmware (confirmed via `wsl --status`, which explicitly reported
  virtualization not enabled, independent of Docker). Considered routing around it
  entirely with a cloud-hosted Postgres (Neon) instead, given the "work machine, IT
  might block me" concern. Decided against making BIOS changes without checking
  with IT first — then the user enabled virtualization themselves and WSL2 came up
  successfully, so reverted the Neon detour and went back to the original
  Docker Compose plan.
- **Bigger issue found while starting step 3's commits:** `git log` / `git ls-tree`
  showed that `.gitignore`, `docs/DECISIONS_LOG.md`, and `docs/CONTEXT.md` were
  never actually committed in step 1 — only `README.md` made it into that first
  commit, despite the commit message claiming all four files. Root cause unclear
  (most likely not all four filenames ended up in the `git add` invocation), but the
  files were still intact on disk, untouched, just never staged. Fixed by
  committing them now, as their own commit, separate from the Docker Compose work.
  **Lesson:** `git status` right before committing (not just before staging) would
  have caught this immediately — worth treating as a standing habit, not just a
  step-1-only checkpoint.

**Decisions:**
- Confirmed: sticking with Docker Compose (not Neon) for local Postgres, now that
  virtualization works. Neon remains a documented fallback option if Docker becomes
  unavailable again.
- `db` is the service/hostname Postgres will be reachable at from other containers.
  Data persists in a named volume (`postgres_data`) so container recreation doesn't
  lose data.

**Next:** Commit the fix + the new `docker-compose.yml`/`.env.example`, verify the
container runs, open the PR, then move to step 4 (backend skeleton + Alembic).

---

## 2026-08-24 — Backend skeleton: db session, app factory, Alembic

**Worked on:** Step 4 in full — `app/db/base.py` (shared `DeclarativeBase`),
`app/db/session.py` (engine, `SessionLocal`, `get_db()` FastAPI dependency),
refactored `app/main.py` from a bare module-level `app` into a `create_app()`
factory, and wired up Alembic (`alembic init`, then pointed `env.py` at
`settings.database_url` and `Base.metadata` instead of the generated
placeholders).

**Decisions:**
- `Base` lives in its own file (`db/base.py`), separate from `db/session.py`,
  so that model files and Alembic's `env.py` can import just the model
  registry without pulling in the live engine/connection setup.
- `main.py` keeps a module-level `app = create_app()` alongside the factory
  function, so `uvicorn app.main:app` and the existing test's
  `from app.main import app` keep working unchanged — the factory pattern
  matters once routers/config start branching (steps 5+), not yet today.
- `alembic.ini`'s hardcoded placeholder `sqlalchemy.url` was deleted rather
  than filled in with a real value, since `alembic.ini` is committed to git;
  the real URL is set at runtime in `env.py` from the same `Settings` object
  the FastAPI app uses, so there's one source of truth for the DB connection
  string instead of two.
- `env.py` appends `backend/` to `sys.path` at the top (before importing
  `app...`), because — unlike `pytest`, which gets this from
  `pythonpath = ["."]` in `pyproject.toml` — the `alembic` CLI has no
  built-in awareness of the project layout.

**Problems encountered:** None blocking. Confirmed the wiring works via
`alembic current` (no error, no revision — expected, since no models/migration
scripts exist yet) against the Docker Compose Postgres container.

**Next:** Push `feature/backend-skeleton`, open the PR, verify the
`backend-tests` CI check passes, self-review, squash-merge, delete the branch,
sync local `main`. Then step 5: Beans vertical slice (model → schema → router
→ service → tests, one PR).

---

## 2026-08-25 — Step 5 started: Beans model

**Worked on:** Step 4's PR merged to `main` (steps 1–4 all complete). Started
step 5 (Beans vertical slice) on a new `feature/beans-slice` branch, working
one piece at a time per usual. Wrote just the `Bean` model this session.

**Decisions:**
- `Bean` fields: `id`, `name`, `roaster`, `origin`, `roast_date`, `created_at`
  — matches the `docs/CONTEXT.md` glossary exactly, no extra fields (declined
  `notes` and `roast_level` for now).
- New `app/models/` package, mirroring the existing flat `app/core/`,
  `app/db/` layout. `app/models/__init__.py` re-exports each model
  (`Bean` so far) — this is the file that will grow as `Shot` and later
  models are added.
- Added `import app.models` to `alembic/env.py` (right after the `Base`
  import) — a model only registers its table on `Base.metadata` by having its
  module actually imported somewhere; inheriting from `Base` alone isn't
  enough. Without this, autogenerate would silently see an empty schema.

**Problems encountered:** None yet.

**Current state (uncommitted, on `feature/beans-slice`):**
- New: `backend/app/models/bean.py`, `backend/app/models/__init__.py`
- Modified: `backend/alembic/env.py` (added the `import app.models` line)
- Nothing committed yet — paused mid-step to pick back up next session.

**Next:** Run `alembic revision --autogenerate -m "add beans table"` against
the Compose Postgres container, review the generated migration, then
`alembic upgrade head` to actually create the `beans` table. After that:
Pydantic schemas → router → service → pytest tests, still all in this same
PR/branch, one piece at a time.

---

## 2026-08-26 — Step 5 continued: beans table migrated

**Worked on:** Generated and applied the first Alembic migration, ran it
against the Compose Postgres container. `beans` table now exists for real,
not just in code.

**Decisions:**
- `python -m alembic ...` is the standard way to invoke Alembic in this
  project from now on, not the `alembic` executable directly. The
  `.venv/Scripts/alembic.exe` launcher stub hit a "Permission denied" under
  Git Bash (an MSYS executable-bit quirk on the auto-generated launcher, not
  a real problem with Alembic itself) — `python -m alembic` calls the
  interpreter directly and sidesteps it, and is more explicit about which
  venv's Python is running the command anyway.
- Reviewed the autogenerated migration (`dcd0df2f5015_add_beans_table.py`)
  by eye before applying — matched the model exactly (all columns
  `NOT NULL` since no field is `Optional` in `Bean`; `created_at` uses a
  Postgres-side `server_default=now()` rather than an app-computed
  timestamp), nothing to hand-edit this time.

**Problems encountered:** The `alembic.exe` permission issue above — worked
around, not a real blocker.

**Verified:** Ran `alembic upgrade head`, then inspected the live table with
`psql \d beans` — confirmed columns, types, `NOT NULL`s, and the
auto-created `beans_id_seq` sequence backing the `id` primary key all match
the model.

**Next:** Pydantic schemas (`app/schemas/bean.py`) — `BeanCreate` (input:
`name`, `roaster`, `origin`, `roast_date`, no `id`/`created_at`) and
`BeanRead` (output: adds `id`, `created_at`) as separate classes from the
`Bean` SQLAlchemy model, decoupling the API's request/response contract from
the DB table shape. Then router → service → tests, same branch/PR.

**Still uncommitted** on `feature/beans-slice`: `app/models/` (Bean model),
`alembic/env.py` (model import), `alembic/versions/dcd0df2f5015_add_beans_table.py`.
Nothing committed yet this whole step — still mid-slice.

---

## 2026-08-27/28 — Schemas, service layer, and a git-commit rhythm

**Worked on:** Wrote `app/schemas/bean.py` (`BeanBase`/`BeanCreate`/`BeanRead`,
with `model_config = ConfigDict(from_attributes=True)` on `BeanRead` so it can
validate directly from an ORM object, not just a dict) and
`app/services/bean.py` (`create_bean`/`list_beans`/`get_bean`, SQLAlchemy
2.0-style `select()`, deliberately no FastAPI imports so it stays
independently testable). Verified `from_attributes` concretely in a live
Python REPL (`BeanRead.model_validate(bean)` on an in-memory `Bean`, then
showed `BeanBase.model_validate(bean)` failing without that config).

**Decisions:**
- No `BeanUpdate` schema — not scoped by the plan (Beans frontend step only
  lists list/create/detail), avoided building for an unrequested feature.
- Then caught up on git hygiene: 4 uncommitted logical pieces had piled up
  (model+migration, schemas, service) with zero commits since the branch was
  created. Split into 4 separate commits (`feat: add Bean model and beans
  table migration`, `feat: add Bean create/read schemas`, `feat: add Bean
  service layer`, `docs: log beans-slice progress`), run by the user
  themselves for git practice. Clarified for future reference: **git commit**
  (local checkpoint, cheap, do it often) vs. **PR** (branch-protection-gated
  request to merge into `main`, opened once per finished vertical slice, not
  per commit) are separate concepts — this repo has no "commit without ever
  needing a PR" path except the one-time step-1 bootstrap commit.

**Problems encountered:**
- `uvicorn.exe` (the router-testing dev server) hit "An Application Control
  policy has blocked this file" — same family of issue as the earlier
  `alembic.exe` Permission Denied, but this time it's Windows itself (likely
  WDAC/Smart App Control on this work machine) blocking the auto-generated
  launcher stub, not just a Git Bash quirk. Same fix: `python -m uvicorn
  app.main:app --reload` instead of the `.exe`. Standardizing on `python -m
  <tool>` project-wide for anything installed as a venv console-script.

**Next:** Router (`app/routers/bean.py`) — `POST /beans`, `GET /beans`,
`GET /beans/{bean_id}`, wired into `main.py` via `app.include_router`. First
real use of `Depends(get_db)`.

---

## 2026-08-29/30 — Router built and manually verified; tests started

**Worked on:** Wrote and wired up the Beans router (`POST /beans` →
`201` + `BeanRead`, `GET /beans` → `list[BeanRead]`, `GET /beans/{bean_id}`
→ `BeanRead` or `404` via `HTTPException`). Manually verified all three
routes end-to-end through Swagger UI (`/docs`): create returned a real
`id`/`created_at`, list showed the created bean, get-by-id matched, and
get-by-missing-id returned `404 {"detail": "Bean not found"}`.

**Problems encountered and resolved:**
- First `POST /beans` attempt hung, then failed with
  `psycopg.errors.ConnectionTimeout` reaching `localhost:5432`. Root cause:
  the Postgres container wasn't actually up yet when the request was made
  (confirmed via `docker compose ps` showing `Up 7 seconds` right after —
  it had just started). This was the *first* time the running app itself
  (via `get_db` → `engine` → `psycopg`) had ever opened a real connection —
  every earlier "it works" check (`alembic upgrade head`, the `psql \d beans`
  inspection) used a separate connection path that didn't prove the live app
  could reach Postgres over `localhost:5432` the same way. Fixed by
  confirming the container was running, then retrying the same request.

**Decisions — test strategy:**
- Walked through the testing pyramid (unit/integration/E2E) and mapped this
  project onto it explicitly, since the user wanted to understand the
  category before writing more tests: `test_health.py` is closest to a unit
  test (no external I/O); the new Beans tests are **integration tests** (real
  FastAPI → service → SQLAlchemy → Postgres, nothing mocked); true unit tests
  don't really fit yet since the service functions are thin DB wrappers with
  no real logic to isolate — the first natural unit-test candidate will be
  step 10's Compare feature (pure ratio/stat calculations); E2E is explicitly
  deferred until a frontend exists, and may be skipped/minimal given the
  timeline.
- Chose a **real separate Postgres test database** (`coffee_shot_test`, same
  server/credentials as dev, different DB name) over in-memory SQLite —
  higher fidelity to production, accepted the extra setup cost (CI needs a
  `postgres:` service block added to `ci.yml`, plus a one-time local
  `CREATE DATABASE coffee_shot_test`). Both still pending.
- Test isolation: after-each-test row deletion (loop over
  `Base.metadata.sorted_tables`), not per-test transaction rollback —
  rollback-based isolation needs SAVEPOINT handling to coexist with the
  service layer's own `db.commit()` calls, judged as unnecessary complexity
  at this scale.
- Schema in the test DB is built via `Base.metadata.create_all()`/`drop_all()`
  in a session-scoped autouse fixture, not by replaying Alembic migrations —
  tests only need to match *current* models, not preserve history.

**Current state — `backend/tests/conftest.py`, built incrementally, one
explained piece at a time (user's explicit request this session): the test
DB engine/session (done), the `app.dependency_overrides[get_db]` swap (done),
the session-scoped create_all/drop_all fixture (done). Still missing: the
per-test cleanup fixture (delete all rows after each test) — paused here
for the night.**

**Also still pending, not yet started:** create the local `coffee_shot_test`
database (one `CREATE DATABASE` command via `docker compose exec`), add the
`postgres:` service block + job env vars to `.github/workflows/ci.yml`, write
`tests/test_beans.py` itself, run the suite locally, then push the branch and
open the PR for the whole slice (6 commits so far, router not yet committed).

**Uncommitted right now:** `app/main.py` (adds `app.include_router`),
`app/routers/` (new), `tests/conftest.py` (new, partial).

---

## 2026-09-02 — Step 5 finished: Beans slice tests written and passing

**Worked on:** Finished `tests/conftest.py` (the per-test row-cleanup fixture —
deletes rows via `reversed(Base.metadata.sorted_tables)`, so child tables
with foreign keys, e.g. `Shot` next slice, get cleared before their parent
`Bean` table, avoiding FK violations), created the local `coffee_shot_test`
database, added a `postgres:` service block + job `env:` to
`.github/workflows/ci.yml`, and wrote `tests/test_beans.py` (create, list,
get-by-id, get-404). All 5 tests pass locally (4 new + the existing health
check).

**Decisions:**
- Test IDs are always read back dynamically from the create response
  (`created["id"]`), never hardcoded — `DELETE` (used for per-test cleanup)
  doesn't reset `beans_id_seq`, so a bean's `id` climbs across the whole test
  run and isn't predictable ahead of time.
- The 404 test uses a hardcoded far-away id (`999999`) rather than computing
  "one past the current max" — collision risk is effectively zero at this
  test suite's scale, so the extra logic isn't worth it.
- Walked through a full "why this order, why each step depends on the last"
  map of the remaining slice work (infra before test cases before running
  before committing before pushing before PR) — user wanted to be able to
  predict the next step themselves, not just follow along. Worth doing this
  kind of explicit sequencing recap again if the same "I can't predict the
  order" feedback comes up in a future slice.

**Problems encountered:** User briefly worried `\l` inside `psql` showing
`template0`/`template1`/`postgres` meant something had been broken by an
accidental keypress — these are just Postgres's own built-in system
databases, present since the container first started, not something created
by user action. No actual problem, just first time seeing `\l` output.

**Next:** Commit the remaining pieces (router, `conftest.py`,
`test_beans.py`, `ci.yml`), push `feature/beans-slice`, open the PR covering
the whole slice, verify the `backend-tests` CI check goes green for real
(this is what actually proves the CI Postgres service config is correct — a
local pass doesn't, since local Postgres is already running regardless),
self-review, squash-merge, sync local `main`, delete the branch. That closes
out step 5 entirely — step 6 (Shots vertical slice) starts fresh after.
