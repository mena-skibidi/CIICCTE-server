# AGENTS.md

This folder is **not a single repo** — it is a composite checkout of 3 independent git repos. There is no root `package.json`, `pyproject.toml`, or `.git` at `C:\Code\CIICCTE-server`. `cd` into the relevant subfolder before running any git/package commands.

## Structure

- `CIICCTE-server-DB/` — Postgres + pgAdmin infrastructure (`github.com/mena-skibidi/CIICCTE-server-DB`)
- `CIICCTE-server-backend-V2/` — FastAPI + SQLModel backend (`github.com/mena-skibidi/CIICCTE-server-backend-V2`)
- `CIICCTE-server-frontend/` — React 19 + Vite 8 + Tailwind 4 frontend (`github.com/mena-skibidi/CIICCTE-server-frontend`)

All three share the external Docker network `db-net`. No CI, no tests, no root task runner.

## Prerequisite: shared network

Every `docker-compose.yaml` declares `networks.db.external: true` with `name: db-net`. Create once before any stack:

```bash
docker network create db-net
```

If `docker compose up` fails with `network db-net declared as external, but could not be found`, this is the fix.

## Startup order (dependency chain)

1. **DB** first — backend hardcodes `postgresql://dbuser:labtest321@db:5432/labdb` (`CIICCTE-server-backend-V2/src/db.py:24`)
2. **Backend** second — frontend assumes backend is reachable at `localhost:8000`
3. **Frontend** last

```bash
# from each subfolder:
docker compose up --build -d   # backend/frontend
docker compose up -d           # DB (no build)
docker compose down            # stop one stack
docker compose down -v         # DB only: wipes db+pgadmin volumes — total data loss
```

Ports: DB `5432`, pgAdmin `8080` (`admin@admin.com` / `admin321`, hostname `db`), backend `8000`, frontend `5173`.

## Backend — `CIICCTE-server-backend-V2/`

- **Runtime:** Python `>=3.14` (`.python-version:1`, `pyproject.toml:6`), managed by `uv`. No `requirements.txt`.
  - Setup: `uv sync` (creates `.venv`, installs `fastapi[standard]`, `sqlmodel`, `psycopg2-binary`, `pwdlib[argon2]`, `pyjwt`)
  - Dev: `uv run fastapi dev src/main.py --host 0.0.0.0` — same command used in `docker-compose.yaml:5`; docs at `http://localhost:8000/docs`
- **Entrypoints:** `src/main.py:16` (FastAPI app `server`), `src/db.py` (SQLModel models `roles`/`users`, engine + `db_setup()` seed), `src/datamodels.py` (Pydantic DTOs)
- **Active endpoints:** only `GET /linux-server-details` (shells out to `fastfetch --json` — requires `fastfetch` in container) and `GET /linux-users` (`pwd.getpwall()` filtered to `uid >= 1000` excl. `65534`). CRUD/login routes at `src/main.py:27-45` are commented out.
- **Docker quirk:** `dockerfile:1` is `FROM nixos/nix` — installs `python314`, `fastfetch`, `uv` via `nix profile add`, then `uv sync`. Slow build; not a standard `python:slim` image. Also mounts `/etc/passwd`, `/etc/group`, `/etc/shadow` read-only (`docker-compose.yaml:12-14`) so `/linux-users` reflects the host, not the container.
- **DB setup:** `db_setup()` (`src/db.py:29`) runs on `startup` event — `create_all(checkfirst=True)` + seeds `roles` (admin/usuario) and default `admin/pwd123`. No Alembic/migrations. Credentials are hardcoded and temporary (see `CIICCTE-server-DB/docker-compose.yaml:7`).
- **API test:** Bruno collection at `bruno/` (endpoints `get_linux_users.yml`, `linux_server_details.yml`, etc.)
- **No lint/typecheck/test config** — `pyproject.toml` has no `[tool.ruff]`/`[tool.pytest]`.

## Frontend — `CIICCTE-server-frontend/`

- **Package manager:** `bun` (`bun.lock` present, `package.json` scripts use `vite`). Do not use `npm`/`yarn`.
  - Install: `bun install` (also in `dockerfile:4`)
  - Dev: `bun run dev --host` (`docker-compose.yaml:5` — binds `0.0.0.0` for Docker)
  - Build: `bun run build` → `tsc -b && vite build`
  - Lint: `bun run lint` (eslint flat config at `eslint.config.js`, ignores `dist`)
  - Preview: `bun run preview`
- **Stack:** Vite 8 + `@vitejs/plugin-react` + `@tailwindcss/vite` (`vite.config.ts:8-10`), React 19.2, TypeScript 6.0, `tsconfig.json` is project-references only.
- **Entrypoints:** `src/main.tsx` → `src/App.tsx` (login UI only, no routing/auth logic yet), `src/style.css`, `index.html`.
- **Docker:** `FROM oven/bun:latest`, exposes `5173:5173`.

## DB — `CIICCTE-server-DB/`

- `docker-compose.yaml` — `postgres` (`ciiccte-db`) + `dpage/pgadmin4:9.17` (`db-gui`), both `restart: always`, volumes `db`/`gui`.
- Schema reference: `drawsql/v3.sql` (source of truth for planned tables: `roles`, `users`, `workspaces`, `containers`, `volumes`, `workspace_type`, `virtual_machines`) — but live DB is auto-created via SQLModel, not this SQL.
- Diagram: `drawsql/` + `drawsql/README.md`; infra screenshot in `.github/`.

## Conventions & gotchas

- Docs/README are in Spanish; compose `down` sections in frontend/backend READMEs say "Como detener la db" but mean their own stack.
- Do not assume a root git operation — commit/push per subfolder: `git -C CIICCTE-server-backend-V2 status` etc.
- Backend `uv.lock` is committed — after editing `pyproject.toml` run `uv sync`/`uv lock` to keep it in sync.
- No environment files — all secrets are hardcoded for local dev; don't add `.env` loading without updating `src/db.py:24` and `CIICCTE-server-DB/docker-compose.yaml`.
