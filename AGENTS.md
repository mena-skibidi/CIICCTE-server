# AGENTS.md

Monorepo con unico `.git` en raiz. Unico compose en `docker-compose.yaml:1` (red `db-net:65`). Carpeta `CIICCTE-server-DB` eliminada; quedan `CIICCTE-server-backend-V2/` y `CIICCTE-server-frontend/`.

## Estructura

- **Backend** `CIICCTE-server-backend-V2/` — FastAPI + SQLModel. Entrypoint `src/main.py:10` (`lifespan` -> `src/db_setup.py:7`). Routers `src/db.py:13` (`/api/db`) y `src/telemetry.py:8` (`/api/telemetry`) + `src/docker_operations.py:1` (docker). Modelos `src/db_models.py:4` (`roles`, `users` con `password_encriptada` hash, `linux_user.unique user_id`), DTOs `src/db_datamodels.py` (`LinkLinuxUserRequest`), logica `src/db_operations.py` (`hash`/`verify` via `src/auth.py:8`), `src/telemetry_operations.py` (fallback `_fallback_physical_disks_from_host:102`). Auth `src/auth.py:28` (`hash_password`/`verify_password` con `pwdlib[argon2]`, `create_token`/`decode_token` con `pyjwt` + `firmatokns.txt:1` secret generado una vez).
- **Frontend** `CIICCTE-server-frontend/` — React 19 + Vite 8 + Tailwind 4 + TS 6. Entrypoint `src/main.tsx` -> `src/App.tsx:4` (`BrowserRouter` con `ProtectedRoute` por `localStorage token/roles_id` -> `AdminScreen` vs `UserScreen`). `AdminScreen` `src/screens/AdminScreen.tsx:5` hub `fixed inset-0 flex` con `Sidebar w-64` + `ContentProxyComponent.tsx:5` proxy por `active`. `Login` `src/components/Login/LoginComponent.tsx:5` (div viewport `fixed inset-0`, card centrada `CIICCTE` `Inicio de sesion`, inputs, boton `Iniciar sesion`/`Cargando...` gris `bg-neutral-400`). `UserScreen` `src/screens/UserScreen.tsx:5` placeholder + logout. `tsconfig.json:1` solo project-references. Sidebar `src/components/Sidebar/` (`BottomInnerComponent.tsx:1` ahora lee `localStorage username/roles_id` y hace logout); contenido `Dashboard/`, `LinuxUsers/` (vincular/desvincular 1-1), `Users/`, `Docker/`.
- **DB** `drawsql/v4.sql` solo diagrama; tablas via `SQLModel.metadata.create_all(checkfirst=True)` en `src/db_setup.py:8`. No Alembic. `down -v` resetea hash.
- **Bruno** `bruno/` (`opencollection.yml`) — `/api/db` y `/api/telemetry`. `POST /api/db/login` ahora retorna `access_token`.

## Comandos

```bash
docker compose up --build -d          # stack completo desde raiz
docker compose logs -f [server|frontend|db]
docker compose down                   # sin borrar volumenes
docker compose down -v                # borra volumenes db+gui — perdida total (necesario tras hash/JWT o unique)
docker compose up server --build -d
```

Puertos: `db` 5432, `gui` 8080 (`admin@admin.com`/`admin321`, host `db`), `server` 8000 (`/docs`), `frontend` 5173.

Backend local: `uv sync && uv run fastapi dev src/main.py --host 0.0.0.0` (requiere Python `>=3.14` en `.python-version:1`; `uv.lock` commiteado). Lint/format: `uvx ruff check` / `uvx ruff format`.

Frontend local: `bun install && bun run dev --host` (usar `bun`, no `npm`/`yarn`). Build/lint: `bun run build` (`tsc -b && vite build`), `bun run lint` (`eslint .`).

## Orden y dependencias

1. `db` primero — URL `postgresql://dbuser:labtest321@db:5432/labdb` en `src/db_setup.py:4`.
2. `server` — `depends_on: db` (`docker-compose.yaml:54`), `privileged:true` + `pid:host` + volumes `/:/host:ro` (fallback discos) y `/var/run/docker.sock:ro` (docker).
3. `frontend` — `depends_on: server` (`docker-compose.yaml:66`); hardcodea `http://localhost:8000` en `DashboardComponent.tsx:31` y `LoginComponent.tsx:17`.

## Gotchas verificados

- Backend dockerfile `FROM nixos/nix` (`dockerfile:1`) — `nix profile add python314/fastfetch/uv`. Build lento.
- `db_setup()` en `lifespan` hace `create_all` + seed `roles` (1=admin,2=usuario) + `users` admin/`pwd123` hasheado via `src/auth.py:52` + `sync_linux_users()`.
- `pwd.getpwall()` linux-only `uid>=1000` excl `65534`; `fastfetch --json` via `asyncio.create_subprocess_exec:14`; fallback ` _fallback_physical_disks_from_host` lee `/host/sys/block` y `/sys/block` (requiere volumen). Docker `get_docker_overview` lee `/var/run/docker.sock:ro` y clasifica `operacional` (ciiccte-server, `db-net`) vs `usuario` (`user-*` prefix) incluye corriendo+dete nidos.
- Passwords: `pwdlib PasswordHasher.recommended()` (`argon2`); `login_process_db:78` verifica con `verify_password` + fallback plaintext. `POST /api/db/login:65` retorna `access_token` (HS256, `firmatokns.txt`), `roles_id` usado en frontend.
- Frontend `vite.config.ts:8` `@vitejs/plugin-react` + `@tailwindcss/vite`. Docker `FROM oven/bun:latest`.
- Auth frontend: `localStorage` `token/username/roles_id/nombre_completo`; `App.tsx:6` `ProtectedRoute` → `AdminScreen` si `roles_id==1` else `UserScreen`; `LoginComponent` maneja `loading` (`bg-neutral-400`/`Cargando...`) y error. Sidebar `BottomInnerComponent.tsx:4` lee `localStorage` para `username#rol` y `navigate("/login")` en logout.
- Estetica: multiplos 8px, `bg-white`, `sky-400` (activo `sky-700`), `neutral-300` bordes, `rounded-lg`, `shadow` sidebar `w-9/10`. Solo desktop. `Login` card `max-w-md` centrada. `Card` error `Algo salio mal...`.
- `linux_user.user_id` ahora `unique=True` (`src/db_models.py:28`) — 1-1 con `users`; `PUT /api/db/linux-users/link` (`src/db.py:70`) maneja `409 ya vinculado`.
- Secretos hardcodeados en `docker-compose.yaml:7`, `src/db_setup.py:4` y `firmatokns.txt:1`; no `.env` sin actualizar todos.
- Git desde raiz.

## Convenciones

- Docs en espanol; no emojis sin pedirlos.
- Tras cada prompt, anadir texto literal a `PROMPTS.md` (mayusculas) como `## Prompt N` y actualizar fecha.
