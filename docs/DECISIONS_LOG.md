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
