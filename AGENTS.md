# AGENTS.md

Este repositorio es un proyecto unificado — contiene DB, backend y frontend en un solo repo con un solo `.git` en la raiz.

Repo: `https://github.com/mena-skibidi/CIICCTE-server` (antes 3 repos separados `CIICCTE-server-DB`, `CIICCTE-server-backend-V2`, `CIICCTE-server-frontend`).

## Structure

- `docker-compose.yaml` — unico compose del proyecto, levanta todo el stack (db + pgadmin + backend + frontend) en la red `db-net`
- `README.md` — documentacion principal en espanol (incluye `## Tech stack`, `## Dev tools` e imagenes de `.github/`)
- `PROMPTS.md` — registro de prompts usados con agentes/LLMs
- `.github/` — imagenes para el README (`v3_diagram.jpg` esquema DB, `docker desktop db containers.png`, `pg-admin dashboard.png`)
- `drawsql/` — referencia del esquema (`v4.sql` solo para cargar el diagrama en https://drawsql.app, no crea tablas, + `README.md`)
- `bruno/` — coleccion Bruno para probar endpoints (`get_linux_users.yml`, `linux_server_details.yml`, etc.)
- `CIICCTE-server-DB/` — codigo relacionado a DB (sin compose propio)
- `CIICCTE-server-backend-V2/` — FastAPI + SQLModel backend
- `CIICCTE-server-frontend/` — React 19 + Vite 8 + Tailwind 4 frontend

Todos los servicios usan la red `db-net` creada automaticamente por el compose unificado. No hay composes por subcarpeta.

No hay CI, tests ni task runner en la raiz.

## Startup order (dependency chain)

1. **DB** primero — backend hardcodea `postgresql://dbuser:labtest321@db:5432/labdb` (`CIICCTE-server-backend-V2/src/db_setup.py:5`)
2. **Backend** segundo — frontend asume backend en `localhost:8000`
3. **Frontend** ultimo

```bash
# UNIFICADO (desde la raiz):
docker compose up --build -d
docker compose logs -f
docker compose down            # detener sin borrar volumenes
docker compose down -v         # borrar volumenes db+gui — perdida total de datos

# INDIVIDUAL desde el compose unificado (raiz):
docker compose up db gui -d
docker compose up server --build -d
docker compose up frontend --build -d
docker compose stop server
```

Ports: DB `5432`, pgAdmin `8080` (`admin@admin.com` / `admin321`, hostname `db`), backend `8000` (`/docs`), frontend `5173`.

## Backend — `CIICCTE-server-backend-V2/`

- **Runtime:** Python `>=3.14` (`.python-version:1`, `pyproject.toml:6`), gestionado por `uv`. No hay `requirements.txt`.
- **Entrypoints:** `src/main.py` (FastAPI app `server` con `lifespan` + `include_router`), `src/db.py` (APIRouter `/api/db`), `src/db_models.py` (SQLModel `roles`/`users`), `src/db_setup.py` (engine + `db_setup()` seed), `src/db_operations.py` (CRUD `create_user_db`/`delete_user_db`/`update_user_db`/`login_process_db`/`get_user_db`/`get_all_users_db`), `src/db_datamodels.py` (Pydantic DTOs `UserPublic`/`UsersResponse`), `src/telemetry.py` (APIRouter `/api/telemetry`), `src/telemetry_operations.py` (ejecuta `fastfetch`/`pwd`), `src/telemetry_datamodels.py` (Pydantic `BaseModel`)
- **Active endpoints:** `GET /api/telemetry/linux-server-details` (ejecuta `fastfetch --json` — requiere `fastfetch` en contenedor) y `GET /api/telemetry/linux-users` (`pwd.getpwall()` filtrado a `uid >= 1000` excl. `65534`) via `telemetry.py`, y `POST /api/db/users`, `DELETE /api/db/users`, `PUT /api/db/users`, `POST /api/db/login`, `GET /api/db/users` (con `?id` o `?username` para individual sin exponer `password_encriptada`, o sin query para todos) via `db.py`.
- **Docker:** `dockerfile:1` es `FROM nixos/nix` — instala `python314`, `fastfetch`, `uv` via `nix profile add`, luego `uv sync`. Build lento; no es imagen `python:slim`. Monta `/etc/passwd`, `/etc/group`, `/etc/shadow` read-only (`docker-compose.yaml:12-14` en compose unificado, ahora `CIICCTE-server-backend-V2/src/telemetry_operations.py:3` usa `pwd`) asi que `/api/telemetry/linux-users` refleja el host, no el contenedor.
- **DB setup:** `db_setup()` (`src/db_setup.py`) corre en `lifespan` de `main.py` — `create_all(checkfirst=True)` + seed de `roles` (admin/usuario) chequeando id↔nombre y usuario por defecto `admin/pwd123`. No hay Alembic/migraciones. Credenciales hardcodeadas y temporales (ver `docker-compose.yaml:7` del compose unificado y `src/db_setup.py:5`).
- **API test:** Bruno collection en `bruno/` en la raiz (`get_linux_users.yml` -> `/api/telemetry/linux-users`, `linux_server_details.yml` -> `/api/telemetry/linux-server-details`, `post_user_admin.yml`/`put_user_admin.yml` -> `/api/db/users`).

## Frontend — `CIICCTE-server-frontend/`

- **Package manager:** `bun` (`bun.lock` presente, `package.json` scripts usan `vite`). No usar `npm`/`yarn`.
- **Stack:** Vite 8 + `@vitejs/plugin-react` + `@tailwindcss/vite` (`vite.config.ts:8-10`), React 19.2, TypeScript 6.0, `tsconfig.json` es project-references only.
- **Entrypoints:** `src/main.tsx` -> `src/App.tsx` (login UI only, sin routing/auth aun), `src/style.css`, `index.html`.
- **Docker:** `FROM oven/bun:latest`, expone `5173:5173`.

## DB — `CIICCTE-server-DB/`

- `docker-compose.yaml` en raiz define `postgres` (`ciiccte-db`) + `dpage/pgadmin4:9.17` (`db-gui`), ambos `restart: always`, volumenes `db`/`gui`.
- `drawsql/v4.sql` es solo para cargar el diseno en https://drawsql.app — no crea tablas. El diagrama grafico del esquema planeado (`roles`, `users`, `linux_user`, `workspaces`, `containers`, `volumes`, `workspace_type`, `virtual_machines`) esta en `drawsql/README.md` y `.github/v3_diagram.jpg`. Las tablas reales se crean automaticamente via SQLModel ORM (`CIICCTE-server-backend-V2/src/db_setup.py:8` `db_setup()`), incluye `linux_user` relacionada a `users`.

## Conventions & gotchas

- Documentacion en espanol; compose unificado en `docker-compose.yaml` en raiz.
- Operaciones git ahora son en la raiz: `git status`, `git diff`, etc. Ya no hay 3 repos separados.
- Backend `uv.lock` esta commiteado — despues de editar `pyproject.toml` correr `uv sync`/`uv lock` para mantenerlo sincronizado.
- No hay archivos `.env` — todos los secretos estan hardcodeados para desarrollo local; no anadir carga de `.env` sin actualizar `src/db_setup.py:5` y el `docker-compose.yaml`.
- `PROMPTS.md` en mayusculas en la raiz registra el uso de IA.

## Registro de prompts con IA

Despues de cada prompt enviado por el usuario, anadir el texto literal del prompt a `PROMPTS.md` en la raiz. Este archivo es la trazabilidad de como se usaron agentes y LLMs en el desarrollo del proyecto. Mantener el formato existente (seccion `## Prompt N` con texto literal) y actualizar la fecha si es necesario. No borrar prompts anteriores.
