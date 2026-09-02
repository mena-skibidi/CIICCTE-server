# AGENTS.md

Monorepo con unico `.git` en raiz. Unico compose en `docker-compose.yaml:1` (red `db-net:65`). Carpeta `CIICCTE-server-DB` eliminada; quedan `CIICCTE-server-backend-V2/` y `CIICCTE-server-frontend/`.

## Estructura

- **Backend** `CIICCTE-server-backend-V2/` — FastAPI + SQLModel. Entrypoint `src/main.py:10` (`lifespan` -> `src/db_setup.py:7`). Routers `src/db.py:13` (`/api/db`) y `src/telemetry.py:8` (`/api/telemetry`). Modelos `src/db_models.py:4` (`roles`, `users`, `linux_user`), DTOs `src/db_datamodels.py` / `src/telemetry_datamodels.py`, logica `src/db_operations.py` / `src/telemetry_operations.py`.
- **Frontend** `CIICCTE-server-frontend/` — React 19 + Vite 8 + Tailwind 4 + TS 6. Entrypoint `src/main.tsx` -> `src/App.tsx:8` (`BrowserRouter` -> `src/screens/DashboardScreen.tsx:6` hub `fixed inset-0 flex` con `Sidebar/SidebarComponent.tsx:11` `w-64` + `DashboardMainContentComponent.tsx:6` proxy por `active` state). `tsconfig.json:1` solo project-references. Sidebar en `src/components/Sidebar/` (`MainComponent`, `MainButtonComponent`, `BottomComponent`); contenido en `src/components/Dashboard/` (`DashboardComponent.tsx:18` fetch `localhost:8000/api/telemetry/linux-server-details`, `Card.tsx:5`) y `src/components/LinuxUsers/`.
- **DB** `drawsql/v4.sql` solo diagrama para drawsql.app; tablas reales via `SQLModel.metadata.create_all(checkfirst=True)` en `src/db_setup.py:8`. No Alembic.
- **Bruno** `bruno/` (`opencollection.yml`) — coleccion para `/api/db` y `/api/telemetry`.
- No hay CI, tests, `opencode.json` ni `.opencode/`. No hay `.env`.

## Comandos

```bash
docker compose up --build -d          # stack completo desde raiz
docker compose logs -f [server|frontend|db]
docker compose down                   # sin borrar volumenes
docker compose down -v                # borra volumenes db+gui — perdida total
docker compose up db gui -d           # solo servicios individuales
docker compose up server --build -d
docker compose up frontend --build -d
```

Puertos: `db` 5432, `gui` 8080 (`admin@admin.com`/`admin321`, host `db`), `server` 8000 (`/docs`), `frontend` 5173.

Backend local: `uv sync && uv run fastapi dev src/main.py --host 0.0.0.0` (requiere Python `>=3.14` en `.python-version:1`; `uv.lock` commiteado, no `requirements.txt`). Lint/format: `uvx ruff check` / `uvx ruff format`. Tras editar `pyproject.toml` correr `uv sync`/`uv lock`.

Frontend local: `bun install && bun run dev --host` (usar `bun`, no `npm`/`yarn` — `bun.lock` presente). Build/lint: `bun run build` (`tsc -b && vite build` en `package.json:8`), `bun run lint` (`eslint .`).

## Orden y dependencias

1. `db` primero — URL hardcodeada `postgresql://dbuser:labtest321@db:5432/labdb` en `src/db_setup.py:4`.
2. `server` — `depends_on: db` (`docker-compose.yaml:47`).
3. `frontend` — `depends_on: server` (`docker-compose.yaml:60`); hardcodea `http://localhost:8000` en `DashboardComponent.tsx:18`.

## Gotchas

- Backend dockerfile `FROM nixos/nix` (`CIICCTE-server-backend-V2/dockerfile:1`) — instala `python314`/`fastfetch`/`uv` via `nix profile add`. Build lento; no es `python:slim`.
- `db_setup()` en `lifespan` hace `create_all` + seed `roles` (1=admin, 2=usuario, corrige id<->nombre) + `users` admin/`pwd123` + `sync_linux_users()`.
- `telemetry_operations.py:36` usa `pwd.getpwall()` (linux-only, `uid>=1000` excl. `65534`) y `fastfetch --json` via `asyncio.create_subprocess_exec:12`. Compose monta `/etc/passwd:/etc/group:/etc/shadow:ro` del host (`docker-compose.yaml:43`): `/api/telemetry/linux-users` refleja el host.
- Frontend `vite.config.ts:8` usa `@vitejs/plugin-react` + `@tailwindcss/vite`. Docker `FROM oven/bun:latest` (`CIICCTE-server-frontend/dockerfile:1`).
- Estetica: multiplos de 8px, `bg-white`, primario `sky-400` (activo `sky-700` en `MainButtonComponent.tsx:5`), bordes `neutral-300`, `rounded-lg` consistente, `shadow` siempre visible en botones sidebar (`w-9/10`, `pt-3 pb-3`, `hover:opacity-90`). Solo desktop, sin responsive. Cards `Card.tsx:5` con `border-neutral-300` y error `Algo salio mal, consulta los logs.`.
- Secretos hardcodeados en `docker-compose.yaml:7` y `src/db_setup.py:4`; no anadir `.env` sin actualizar ambos.
- Git siempre desde raiz, no por subcarpeta.

## Convenciones

- Docs en espanol; no emojis sin pedirlos.
- Tras cada prompt del usuario, anadir su texto literal a `PROMPTS.md` (mayusculas) como `## Prompt N` preservando historial y actualizar fecha.
