# CIICCTE-server-frontend

## Sobre el proyecto

Frontend creado para interactuar con la infraestructura de CIICCTE-server-backend-V2

## Tech stack

Por motivos de documentacion, este es el stack de tecnologias usado para el desarrollo de este repo

- bun como runtime de js y gestor de paquetes
- vite para el servidor y por el ecosistema de desarrollo
- tailwindcss para desarrollar de manera rapida el apartado estetico
- react para iterar de manera rapida y estandarizada para el desarrollo del frontend
- docker como runtime de contenedores
- dockerfiles para generar la imagen del servidor
- docker compose para el depliegue del contenedor


## Como iniciar el frontend

Antes de correr el backend es importante recordar que el frontend solo es el apartado visual de la conexion a otros sistemas por lo mismo es importante asegurarse que la [db](https://github.com/mena-skibidi/CIICCTE-server-DB) y el [backend](https://github.com/mena-skibidi/CIICCTE-server-backend-V2) esten corriendo para que este funcione correctamente

1. Clonar el repositorio

```bash
git clone https://github.com/mena-skibidi/CIICCTE-server-frontend.git
```

2. Desde la terminal se ingresara a ese directorio y se debera ejecutara el comando

```bash
docker compose up --build -d
```

## Como detener la db

Si el programa se ejecuto en modo detached (con la -d) se debera navegar al directorio y en la terminal correr lo siguiente para detener el proceso

```bash
docker compose down
```