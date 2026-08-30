# CIICCTE-server

## Sobre el proyecto

Software que funge como servidor para gestionar la abstraccion entre el frontend y los workspaces personales dentro del CIICCTE.

Este repositorio unifica los tres componentes que antes estaban separados:

- `CIICCTE-server-DB/` - infraestructura de base de datos con Postgres y pgAdmin
- `CIICCTE-server-backend-V2/` - servidor que expone la logica del sistema y los endpoints
- `CIICCTE-server-frontend/` - interfaz visual para interactuar con el sistema

## Tech stack

Por motivos de documentacion, este es el stack de tecnologias usado para el desarrollo de este repo

- postgresql como base de datos, corre en el puerto 5432
- pgadmin para consultar la base de datos de manera visual, corre en el puerto 8080
- python como lenguaje de programacion debido a su facilidad de uso
- fastapi como servidor debido a su facilidad de uso y rendimiento
- sqlmodel por ser un proyecto mantenido por el equipo de fastapi y ser un wrapper alrededor de sqlalchemy
- nix para instalar dependencias a nivel de contenedor (python, fastfetch, uv)
- fastfetch para obtener detalles del servidor linux
- bun como runtime de js y gestor de paquetes
- vite para el servidor y por el ecosistema de desarrollo
- tailwindcss para desarrollar de manera rapida el apartado estetico
- react para iterar de manera rapida y estandarizada para el desarrollo del frontend
- typescript como lenguaje para el frontend
- docker como runtime de contenedores
- docker compose para el despliegue de los contenedores

## Requisitos previos

- docker y docker compose instalados
- para el compose unificado no es necesario crear la red manualmente, la red `db-net` se crea automaticamente
- para los composes individuales por subcarpeta si es necesario crear la red una vez:

```bash
docker network create db-net
```

Si `docker compose up` falla con `network db-net declared as external, but could not be found`, esa es la solucion.

## Como iniciar el proyecto

1. Clonar el repositorio:

```bash
git clone https://github.com/mena-skibidi/CIICCTE-server
```

### Opcion A: compose unificado (recomendado)

Levanta todos los servicios a la vez desde la raiz del proyecto:

```bash
docker compose up --build -d
```

Ver logs:

```bash
docker compose logs -f
```

Ver estado:

```bash
docker compose ps
```

Puertos:

| Servicio | Puerto | URL |
|----------|--------|-----|
| db (postgres) | 5432 | localhost:5432 |
| pgadmin | 8080 | http://localhost:8080 |
| backend | 8000 | http://localhost:8000/docs |
| frontend | 5173 | http://localhost:5173 |

Para pgAdmin usar `admin@admin.com` / `admin321` y para agregar la base de datos usar hostname `db`, usuario `dbuser`, contrasena `labtest321`, base `labdb`.

### Opcion B: servicios individuales desde el compose unificado

Desde la raiz se puede iniciar solo lo necesario:

```bash
# solo base de datos y pgadmin
docker compose up db gui -d

# solo backend
docker compose up server --build -d

# solo frontend
docker compose up frontend --build -d

# combinacion db + backend + frontend
docker compose up db server frontend -d
```

Ver logs de un servicio:

```bash
docker compose logs -f server
docker compose logs -f frontend
docker compose logs -f db
```

Reiniciar un servicio:

```bash
docker compose restart server
```

### Opcion C: composes individuales por subcarpeta (compatibilidad)

Cada subcarpeta conserva su `docker-compose.yaml` original con `external: true` para `db-net`. Requiere crear la red una vez:

```bash
docker network create db-net
```

Luego:

```bash
docker compose -f CIICCTE-server-DB/docker-compose.yaml up -d
docker compose -f CIICCTE-server-backend-V2/docker-compose.yaml up --build -d
docker compose -f CIICCTE-server-frontend/docker-compose.yaml up --build -d
```

## Como detener los servicios

### Compose unificado

```bash
# detener sin borrar volumenes
docker compose down

# detener un servicio especifico
docker compose stop server
docker compose stop frontend
docker compose stop gui
docker compose stop db
```

Si se desea purgar o re-empezar el proyecto junto a los volumenes (perdida total de datos):

```bash
docker compose down -v
```

### Composes individuales

```bash
docker compose -f CIICCTE-server-DB/docker-compose.yaml down
docker compose -f CIICCTE-server-DB/docker-compose.yaml down -v
docker compose -f CIICCTE-server-backend-V2/docker-compose.yaml down
docker compose -f CIICCTE-server-frontend/docker-compose.yaml down
```

## Estructura del repositorio

```
CIICCTE-server/
  docker-compose.yaml              # compose unificado
  README.md
  PROMPTS.md
  AGENTS.md
  CIICCTE-server-DB/
    docker-compose.yaml            # compose individual (db + pgadmin)
    drawsql/
      v3.sql                       # solo para cargar diagramas en drawsql.app
      README.md
      drawSQL-image-export-2026-08-15.jpg
  CIICCTE-server-backend-V2/
    docker-compose.yaml            # compose individual (server)
    dockerfile
    src/
      main.py
      db.py
      datamodels.py
    bruno/
  CIICCTE-server-frontend/
    docker-compose.yaml            # compose individual (frontend)
    dockerfile
    src/
      main.tsx
      App.tsx
    vite.config.ts
```

## Notas

- Las tablas de la base de datos se crean automaticamente via SQLModel ORM (`src/db.py:29` `db_setup()` con `create_all(checkfirst=True)`), no con el archivo `drawsql/v3.sql`. Ese archivo SQL y los diagramas en `drawsql/` son solo una referencia grafica del esquema planeado (`roles`, `users`, `workspaces`, `containers`, `volumes`, `workspace_type`, `virtual_machines`) y sirven para cargar el diseno en https://drawsql.app.
- Al iniciar, el backend crea los roles `admin`/`usuario` y el usuario por defecto `admin` / `pwd123` si no existen.
- Todas las credenciales estan hardcodeadas para desarrollo local y son temporales. No hay archivos `.env`.
- La documentacion del backend esta disponible en `http://localhost:8000/docs` y `http://localhost:8000/redoc` cuando el backend esta corriendo.
