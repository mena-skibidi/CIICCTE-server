# AGENTS.md

Este repositorio es un proyecto unificado — contiene DB, backend y frontend en un solo repo con un solo `.git` en la raiz.

Repo: `https://github.com/mena-skibidi/CIICCTE-server` (antes 3 repos separados `CIICCTE-server-DB`, `CIICCTE-server-backend-V2`, `CIICCTE-server-frontend`).

## Structure

- `docker-compose.yaml` — unico compose del proyecto, levanta todo el stack (db + pgadmin + backend + frontend) en la red `db-net`
- `README.md` — documentacion principal en espanol (incluye `## Tech stack`, `## Dev tools` e imagenes de `.github/`)
- `PROMPTS.md` — registro de prompts usados con agentes/LLMs
- `.github/` — imagenes para el README (`v3_diagram.jpg` esquema DB, `docker desktop db containers.png`, `pg-admin dashboard.png`)
- `drawsql/` — referencia del esquema (`v3.sql` solo para cargar el diagrama en https://drawsql.app, no crea tablas, + `README.md`)
- `bruno/` — coleccion Bruno para probar endpoints (`get_linux_users.yml`, `linux_server_details.yml`, etc.)
- `CIICCTE-server-DB/` — codigo relacionado a DB (sin compose propio)
- `CIICCTE-server-backend-V2/` — FastAPI + SQLModel backend
- `CIICCTE-server-frontend/` — React 19 + Vite 8 + Tailwind 4 frontend

Todos los servicios usan la red `db-net` creada automaticamente por el compose unificado. No hay composes por subcarpeta.

No hay CI, tests ni task runner en la raiz.

## Startup order (dependency chain)

1. **DB** primero — backend hardcodea `postgresql://dbuser:labtest321@db:5432/labdb` (`CIICCTE-server-backend-V2/src/db.py:24`)
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
- **Entrypoints:** `src/main.py:16` (FastAPI app `server`), `src/db.py` (SQLModel models `roles`/`users`, engine + `db_setup()` seed), `src/datamodels.py` (Pydantic DTOs)
- **Active endpoints:** solo `GET /linux-server-details` (ejecuta `fastfetch --json` — requiere `fastfetch` en contenedor) y `GET /linux-users` (`pwd.getpwall()` filtrado a `uid >= 1000` excl. `65534`). Rutas CRUD/login en `src/main.py:27-45` estan comentadas.
- **Docker:** `dockerfile:1` es `FROM nixos/nix` — instala `python314`, `fastfetch`, `uv` via `nix profile add`, luego `uv sync`. Build lento; no es imagen `python:slim`. Monta `/etc/passwd`, `/etc/group`, `/etc/shadow` read-only (`docker-compose.yaml:12-14`) asi que `/linux-users` refleja el host, no el contenedor.
- **DB setup:** `db_setup()` (`src/db.py:29`) corre en evento `startup` — `create_all(checkfirst=True)` + seed de `roles` (admin/usuario) y usuario por defecto `admin/pwd123`. No hay Alembic/migraciones. Credenciales hardcodeadas y temporales (ver `docker-compose.yaml:7` del compose unificado).
- **API test:** Bruno collection en `bruno/` en la raiz (endpoints `get_linux_users.yml`, `linux_server_details.yml`, etc.)

## Frontend — `CIICCTE-server-frontend/`

- **Package manager:** `bun` (`bun.lock` presente, `package.json` scripts usan `vite`). No usar `npm`/`yarn`.
- **Stack:** Vite 8 + `@vitejs/plugin-react` + `@tailwindcss/vite` (`vite.config.ts:8-10`), React 19.2, TypeScript 6.0, `tsconfig.json` es project-references only.
- **Entrypoints:** `src/main.tsx` -> `src/App.tsx` (login UI only, sin routing/auth aun), `src/style.css`, `index.html`.
- **Docker:** `FROM oven/bun:latest`, expone `5173:5173`.

## DB — `CIICCTE-server-DB/`

- `docker-compose.yaml` en raiz define `postgres` (`ciiccte-db`) + `dpage/pgadmin4:9.17` (`db-gui`), ambos `restart: always`, volumenes `db`/`gui`.
- `drawsql/v3.sql` es solo para cargar el diseno en https://drawsql.app — no crea tablas. El diagrama grafico del esquema planeado (`roles`, `users`, `workspaces`, `containers`, `volumes`, `workspace_type`, `virtual_machines`) esta en `drawsql/README.md` y `.github/v3_diagram.jpg`. Las tablas reales se crean automaticamente via SQLModel ORM (`CIICCTE-server-backend-V2/src/db.py:29` `db_setup()`).

## Conventions & gotchas

- Documentacion en espanol; compose unificado en `docker-compose.yaml` en raiz.
- Operaciones git ahora son en la raiz: `git status`, `git diff`, etc. Ya no hay 3 repos separados.
- Backend `uv.lock` esta commiteado — despues de editar `pyproject.toml` correr `uv sync`/`uv lock` para mantenerlo sincronizado.
- No hay archivos `.env` — todos los secretos estan hardcodeados para desarrollo local; no anadir carga de `.env` sin actualizar `src/db.py:24` y el `docker-compose.yaml`.
- `PROMPTS.md` en mayusculas en la raiz registra el uso de IA.

## Registro de prompts con IA

Despues de cada prompt enviado por el usuario, anadir el texto literal del prompt a `PROMPTS.md` en la raiz. Este archivo es la trazabilidad de como se usaron agentes y LLMs en el desarrollo del proyecto. Mantener el formato existente (seccion `## Prompt N` con texto literal) y actualizar la fecha si es necesario. No borrar prompts anteriores.
