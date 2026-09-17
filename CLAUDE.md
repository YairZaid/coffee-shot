# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Coffee Shot Intelligence — a data-driven platform for recording, analyzing, and experimenting with espresso shots, built as a portfolio project. Backend only exists so far; frontend (Next.js/TypeScript/Tailwind) has not been started. See `docs/DECISIONS_LOG.md` (newest entry at the bottom) for the authoritative session-by-session history of what was built, why, and what's next — read it before picking up new work.

## Commands

All backend commands run from `backend/` with the project's venv active.

```bash
# Local Postgres (run from repo root, needs a real .env copied from .env.example)
docker compose up -d
docker compose exec db psql -U coffee -d coffee_shot -c "\d <table>"   # inspect a table; role is always "coffee", not the postgres default

# Dev server
python -m uvicorn app.main:app --reload

# Migrations
python -m alembic revision --autogenerate -m "add X table"   # writes a migration file only, does not touch the DB
python -m alembic upgrade head                                # actually runs pending migrations
python -m alembic current

# Lint (runs before tests in CI; must be clean)
ruff check .
ruff check . --fix

# Tests (needs a separate local `coffee_shot_test` database created once via `CREATE DATABASE`)
pytest
pytest tests/test_shots.py::test_create_shot   # single test
```

Always invoke `alembic`/`uvicorn` via `python -m`, not the installed `.exe` launcher stubs — those get blocked on this machine (Git Bash permission issue for alembic; Windows WDAC/Smart App Control for uvicorn).

## Architecture

FastAPI + SQLAlchemy 2.0 + Alembic + Postgres, organized as **vertical slices per resource** (`Bean`, `Shot`, ...), each slice cutting through the same five layers:

- `app/models/<resource>.py` — SQLAlchemy `Mapped`/`mapped_column` model, inherits `app/db/base.py`'s `Base`. A model only registers on `Base.metadata` by being imported somewhere — `app/models/__init__.py` re-exports every model, and `alembic/env.py` does `import app.models` (the whole package) specifically so new models need no `env.py` changes.
- `app/schemas/<resource>.py` — Pydantic: a `*Base` with shared fields, `*Create` (input, no `id`/`created_at`), `*Read` (output, adds them, `model_config = ConfigDict(from_attributes=True)` so it validates straight from an ORM instance).
- `app/services/<resource>.py` — plain functions taking `db: Session` first, deliberately with **no FastAPI imports**, so the DB logic stays testable independent of the web layer.
- `app/routers/<resource>.py` — thin `APIRouter` wiring `Depends(get_db)` (from `app/db/session.py`) into the service functions; 404s are raised here, not in the service layer. Registered onto the app in `app/main.py`'s `create_app()` via `app.include_router(...)`.
- `tests/test_<resource>.py` — integration tests through the real FastAPI → service → SQLAlchemy → Postgres stack (nothing mocked), against the `coffee_shot_test` database.

`app/core/config.py`'s `Settings` (pydantic-settings) reads the repo-root `.env` and is the single source of the DB connection string — both `app/db/session.py`'s engine and `alembic/env.py` build their URL from it (never hardcoded in `alembic.ini`). Test config in `tests/conftest.py` builds a second engine pointed at `coffee_shot_test` instead, overrides the `get_db` FastAPI dependency, creates/drops all tables via `Base.metadata` in a session-scoped fixture (not by replaying Alembic migrations), and cleans rows after every test by deleting through `reversed(Base.metadata.sorted_tables)` — reverse table order so a child table with a foreign key (e.g. `Shot → Bean`) is cleared before its parent.

New/derived fields (e.g. `ratio = yield ÷ dose`) are computed, never stored as their own column — see `docs/CONTEXT.md` for the domain glossary and naming decisions (`rating` not `taste`, `grind_time` distinct from `duration`, `shot_yield` not `yield` since `yield` is a reserved Python keyword). Check that file before naming any new field.

`docs/NEW_MODULE_GUIDE.md` is a personal step-by-step checklist for adding a new resource slice, built from how Beans and Shots were actually implemented — deliberately gitignored, not part of repo history, but worth reading on disk before starting a new resource.

## Conventions

- One PR per vertical slice/roadmap step, not per commit. Commit in small logical pieces within that PR (e.g. model+migration, schemas, service, router, tests, docs each as their own commit).
- Service layer is intentionally minimal (create/list/get) — don't add filtered queries, update endpoints, or validation layers ahead of what the current slice's scope actually calls for (e.g. `POST /shots` with a bad `bean_id` currently 500s via an unhandled FK `IntegrityError` rather than a clean 404/422 — known, deliberately not yet fixed).
