# AGENTS.md

Repo unificado con unico `.git` en raiz. Antes 3 repos; `CIICCTE-server-DB` eliminado. Quedan `CIICCTE-server-backend-V2/` y `CIICCTE-server-frontend/`. Unico compose en `docker-compose.yaml:1` (red `db-net` en `docker-compose.yaml:64`).

## Estructura y stack

- `CIICCTE-server-backend-V2/` — FastAPI + SQLModel. Entrypoint `src/main.py:10` (`lifespan` -> `src/db_setup.py:7` `db_setup()`). Routers `src/db.py:13` (`/api/db`) y `src/telemetry.py:8` (`/api/telemetry`). Modelos `src/db_models.py:4` (`roles`, `users`, `linux_user`), DTOs `src/db_datamodels.py:1` / `src/telemetry_datamodels.py`, logica `src/db_operations.py` / `src/telemetry_operations.py`.
- `CIICCTE-server-frontend/` — React 19 + Vite 8 + Tailwind 4 + TS 6. Entrypoint `src/main.tsx:6` -> `src/App.tsx:8` (`BrowserRouter` -> `src/screens/DashboardScreen.tsx:6` hub `fixed inset-0 flex justify-center` con `Sidebar/SidebarComponent` w-64 + `DashboardMainContentComponent` proxy). `tsconfig.json:1` solo project-references. Componentes `src/components/Sidebar/` (`SidebarComponent`, `MainComponent`, `MainButtonComponent`, `BottomComponent`, `BottomInnerComponent`) + `DashboardMainContentComponent`/`DashboardTelemetryComponent`/`DashboardLinuxUsersComponent` (placeholders fuera de sidebar). `TopComponent`/`TopInnerComponent`/`CIICCTE-Web Panel` eliminados.
- `drawsql/v4.sql` — solo para cargar diagrama en drawsql.app; no crea tablas. Tablas reales via `SQLModel.metadata.create_all(checkfirst=True)` en `src/db_setup.py:8`.
- `bruno/` (`opencollection.yml`) — coleccion versionada para endpoints (`/api/db`, `/api/telemetry`).
- `PROMPTS.md` (mayusculas) — trazabilidad de prompts IA. `README.md` — docs en espanol.
- No hay CI, tests, ni task runner en raiz. No hay `opencode.json` ni `.opencode/`.

## Comandos

```bash
# Stack completo (desde raiz)
docker compose up --build -d
docker compose logs -f            # todos
docker compose logs -f server     # uno
docker compose down               # sin borrar volumenes
docker compose down -v            # borra volumenes db+gui — perdida total de datos

# Servicios individuales
docker compose up db gui -d
docker compose up server --build -d
docker compose up frontend --build -d
docker compose stop server
```

Puertos: `db` 5432, `gui` 8080 (`admin@admin.com`/`admin321`, host `db`), `server` 8000 (`/docs`, `/redoc`), `frontend` 5173.

Backend local (sin docker): `uv sync` + `uv run fastapi dev src/main.py --host 0.0.0.0` (requiere Python `>=3.14`, ver `CIICCTE-server-backend-V2/.python-version:1`). Tras editar `pyproject.toml` ejecutar `uv sync` / `uv lock` — `uv.lock` commiteado. No hay `requirements.txt`. Lint/format: `uvx ruff check` / `uvx ruff format`.

Frontend local: `bun install` + `bun run dev --host` (usar `bun`; no `npm`/`yarn` — `bun.lock` presente). Build/lint: `bun run build` (`tsc -b && vite build` en `package.json:8`), `bun run lint` (`eslint .`).

## Orden y dependencias

1. `db` primero — backend hardcodea `postgresql://dbuser:labtest321@db:5432/labdb` en `src/db_setup.py:4`.
2. `server` segundo — `depends_on: db` (`docker-compose.yaml:47`).
3. `frontend` ultimo — `depends_on: server` (`docker-compose.yaml:60`), asume backend en `localhost:8000`.

## Gotchas verificados

- Backend dockerfile `FROM nixos/nix` (`CIICCTE-server-backend-V2/dockerfile:1`) — instala `python314`/`fastfetch`/`uv` via `nix profile add`. Build lento; no es `python:slim`.
- `db_setup()` en `lifespan` hace `create_all` + seed `roles` (1=admin, 2=usuario, chequea id<->nombre) + usuario `admin`/`pwd123` + `sync_linux_users()`. No hay Alembic/migraciones.
- `src/telemetry_operations.py:36` usa `pwd.getpwall()` (linux-only, `uid >= 1000` excl. `65534`) y `fastfetch --json` via `asyncio.create_subprocess_exec` (`src/telemetry_operations.py:12`). Solo funciona en Linux/contenedor con `fastfetch`; compose monta `/etc/passwd:/etc/group:/etc/shadow:ro` del host (`docker-compose.yaml:43`) asi que `/api/telemetry/linux-users` refleja el host.
- Frontend `vite.config.ts:8` usa `@vitejs/plugin-react` + `@tailwindcss/vite`. Docker frontend `FROM oven/bun:latest` (`CIICCTE-server-frontend/dockerfile:1`).
- Estetica frontend: medidas multiplo de 8px, fondo `bg-white`, primarios `sky-400`, bordes/lineas `neutral-300` (antes `blue-700`/`neutral-500`), `rounded-lg` consistente en todos los elementos redondeados. Solo desktop, sin responsive. Botones sidebar `MainButtonComponent` `w-9/10` (90% ancho) centrados con `pt-3 pb-3`, `rounded-lg` + `shadow` siempre visible (`hover:opacity-90` solo opacidad). Texto CIICCTE/Web Panel removido del proyecto. Componentes del sidebar en `src/components/Sidebar/` cargados via `DashboardScreen` hub.
- No hay `.env` — secretos hardcodeados (`docker-compose.yaml:7`, `src/db_setup.py:4`). No anadir carga `.env` sin actualizar ambos.
- Git se opera en raiz (`git status` etc.), no por subcarpeta.

## Convenciones

- Documentacion en espanol; no anadir emojis a docs sin pedirlos.
- Tras cada prompt del usuario, anadir su texto literal a `PROMPTS.md` como `## Prompt N` (preservar historial, actualizar fecha). Formato existente en `PROMPTS.md:1`.
