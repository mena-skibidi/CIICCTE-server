# AGENTS.md

Repo unificado con unico `.git` en raiz. Antes 3 repos (`CIICCTE-server-DB`, `CIICCTE-server-backend-V2`, `CIICCTE-server-frontend`).

## Stack y estructura

- `docker-compose.yaml` (raiz) — unico compose; red `db-net` (`:65`). No hay composes por subcarpeta.
- `CIICCTE-server-backend-V2/` — FastAPI + SQLModel. Entrypoint `src/main.py` (`lifespan` -> `src/db_setup.py:7` `db_setup()`). Routers: `src/db.py` (`/api/db`), `src/telemetry.py` (`/api/telemetry`).
- `CIICCTE-server-frontend/` — React 19 + Vite 8 + Tailwind 4 + TS 6. Entrypoint `src/main.tsx` -> `src/App.tsx`. `tsconfig.json` es solo project-references.
- `CIICCTE-server-DB/` — solo codigo ref; DB real via compose (`postgres` + `dpage/pgadmin4:9.17`).
- `drawsql/v4.sql` — solo para cargar diagrama en drawsql.app; no crea tablas. Tablas reales via `SQLModel.metadata.create_all(checkfirst=True)` en `CIICCTE-server-backend-V2/src/db_setup.py:8`.
- `bruno/` — coleccion para probar endpoints. `PROMPTS.md` (mayusculas) — trazabilidad de prompts IA.

No hay CI, tests, ni task runner en raiz.

## Comandos

```bash
# Stack completo (desde raiz)
docker compose up --build -d
docker compose logs -f            # todos
docker compose logs -f server     # uno
docker compose down               # sin borrar volumenes
docker compose down -v            # borra volumenes db+gui — perdida total de datos

# Servicios individuales (desde compose unificado)
docker compose up db gui -d
docker compose up server --build -d
docker compose up frontend --build -d
docker compose stop server
```

Puertos: `db` 5432, `gui` 8080 (`admin@admin.com`/`admin321`, host `db`), `server` 8000 (`/docs`), `frontend` 5173.

Backend local (sin docker): `uv sync` + `uv run fastapi dev src/main.py --host 0.0.0.0` (requiere Python `>=3.14`, ver `CIICCTE-server-backend-V2/.python-version`). Tras editar `pyproject.toml` ejecutar `uv sync`/`uv lock` — `uv.lock` esta commiteado. No hay `requirements.txt`. Lint/format: `uvx ruff check` / `uvx ruff format`.

Frontend local: `bun install` + `bun run dev --host` (usar `bun`; no `npm`/`yarn` — `bun.lock` presente). Build/lint: `bun run build` (`tsc -b && vite build`), `bun run lint` (`eslint .`).

## Orden y dependencias

1. `db` primero — backend hardcodea `postgresql://dbuser:labtest321@db:5432/labdb` en `CIICCTE-server-backend-V2/src/db_setup.py:4`.
2. `server` segundo — `depends_on: db`.
3. `frontend` ultimo — `depends_on: server`, asume backend en `localhost:8000`.

## Gotchas verificados

- Backend dockerfile `FROM nixos/nix` — instala `python314`/`fastfetch`/`uv` via `nix profile add`. Build lento; no es `python:slim`.
- `db_setup()` en `lifespan` hace `create_all` + seed `roles` (1=admin, 2=usuario, chequea id↔nombre) + usuario `admin`/`pwd123` + `sync_linux_users()`. No hay Alembic/migraciones.
- `src/telemetry_operations.py` usa `pwd.getpwall()` (linux-only, filtrado `uid >= 1000` excl. `65534`) y `fastfetch --json` via `asyncio.create_subprocess_exec`. Funciona solo en Linux/contenedor con `fastfetch`; compose monta `/etc/passwd:/etc/group:/etc/shadow:ro` del host (`docker-compose.yaml:43-46`) asi que `/api/telemetry/linux-users` refleja el host.
- Frontend `vite.config.ts:8` usa `@vitejs/plugin-react` + `@tailwindcss/vite`. Docker frontend `FROM oven/bun:latest`.
- No hay `.env` — secretos hardcodeados (`docker-compose.yaml:7`, `src/db_setup.py:4`). No anadir carga `.env` sin actualizar ambos.
- Git se opera en raiz (`git status` etc.), no por subcarpeta.

## Convenciones

- Documentacion en espanol; no anadir emojis a docs sin pedirlos.
- Tras cada prompt del usuario, anadir su texto literal a `PROMPTS.md` como `## Prompt N` (preservar historial, actualizar fecha). Formato existente en `PROMPTS.md:1`.
