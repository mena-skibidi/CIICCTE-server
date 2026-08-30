# PROMPTS.md

Este archivo registra los prompts usados para generar documentacion e infraestructura con agentes y LLMs durante el desarrollo de este proyecto.

Modelo: muse-spark-1.2-contributor-free via opencode.
Repositorio: https://github.com/mena-skibidi/CIICCTE-server
Fecha de sesion: 2026-08-30

---

## Prompt 1

I removed the existing repos git files and merged them into a single project, can you produce a readme.md in spanish that states the project components and the software used all in simple language, no emojis and following the aesthethics of the existing readmes?

## Prompt 2

Yes, the git clone url should be the new one which is https://github.com/mena-skibidi/CIICCTE-server, but i forgot to mention that it would be nice if you created a new compose file that starts the previously split compose files into a single one, and add code snippets explainning how to start/stop individual services as well as how to launche the unified compose file, therefore remove the existing readmes, update the agents.md to reflect this, remove the local development setup info in the readmes and if possible create a file named prompts.md where all the text i have written in this sessino will be stored as to show how ai agents and llms were used for the developnebt of this project

## Prompt 3

the compose network should be kept to using db-net, the drawsql stuff reflected the planned db schemas graphically whilst the sql file was used for loading the diagrams into drawsql as the db table creation process is done through the sqlmodel orm, double check if the AGENTS.md has the directive of adding the prompts into the prompts.md file after every prompt is send and change prompts.md to uppercase

## Prompt 4

yes (recuerda no cometas errores)

## Prompt 5

done, you can begin

## Prompt 6

remove the option c thing from the readme, remove the prevous compose files from the individual folders, and make the compose unificado workflow the only one used across the project

## Prompt 7

add the .github images to the readme, place them according to their context as some might be from the sql schemas, other from tools and so on, i reorganized existing folders and deleted some that were not necessary, add a section to the main readme named Dev tools where you talk about uv, bun, bruno, nix, opencode and other tools used for the dev process that were not mentioned on the teck stack section

## Prompt 8

Lets restructure the code in server-backend, make main.py the file dedicated to beginning the fastapi process, then create files for db_operations, db_utility and use the main db file as the file dedicated to handling fastapi requests related to db operations thus rearreging the existing code into the new files, also create a file named telemetry and telemetry_operations where telemetry will be used as to handle requests related to getting telemetry data from the linux host, and telemetry_operations the place where the functions executing code in the server will be stored, and as for data models you can produce stuff such as telemtry_datamodels and db_datamodels in order to segment datamodels according to their purposes

## Prompt 9

datamodels tambien debe ser separado en db_datamodels y telemetry_datamodels, arregla tambien los imports referenciando los nuevos archivos, para evitar problemas de imports se puede correr ruff mediante uvx para resolver dependencias ciclicas o rotas, por el momento no arregles bugs de logica, solo reacomoda el codigo en los nuevos archivos, no hay problema si el codigo falla en windows pues el proyecto esta disenado para correr en linux, lo de el evento startup  si es posible arreglarlo usando la nueva forma de gestionar evento con el async context manager hazlo si se rompe el codigo la opcion deprecada funciona bien, no uses prefijos de comptabilidad, las pruebas de bruno se debeb adaptar a las urls del backend, no mantegas ese apartado de compatibilidad de datamodels mejor actualiza las tests de bruno para reflejar los cambios a la infraestructura, usa db_models para los roles y users, para telemetry_datamodels usa BaseModel y si borra el datamodels centralizado despues de separar los datamodels en sus respectivos sub archivos

## Prompt 10

usa las rutas de db y telemetry

## Prompt 11

usa /api/x

## Prompt 12

( /api/db y /api/telemetry

## Prompt 13

comienza

## Prompt 14

Ahora anteriormnete mencionaste un bug en la auntenticacion y en la seccion de roles

## Prompt 15

a) arregla el detalle de la comparacion que siempre regresa true pues lo que se buscaba era verificar que en la db existiera una entrada que fuera identica mediante esa comparacion. Lo de login process db por el momento es solo para debuggear no es funcional. Lo de el texto plano y password encriptada es temporalmente un boilerplate por loque asi se encuentra bien. B) Arregla el detalle del rol, cuando se cambia el estatus de la cuenta se debe hacer el .commit, renombra db_utility a db_setup, en el error de db utility sobre el id duplicado inicialmente se tenia contemplado que el sistema fuera generado en orden pero tienes razon para evitar situaciones inesperadas se debe charcar la id del rol y a que corresponde si a user o admin, en lo de create user db habria que agregar una comprobacion de rol, que puede ser gestionada mediante el proceso anteriomente mencionado o checando mediante un select. 4) por el momento no, delte debe regresar codigo 200, se debera pasar el tipo de rol explicitamente pues es posible que en el frontend un usuario sea marcado como user o admin

## Prompt 16

procede a ejecutar el plan

## Prompt 17

Genera el endpoint get para obtener a un usuario de la db con 2 opciones una con un datamodel donde se filtre por la id del usuario y otra donde se filtra por el username, en caso de que si exista un usuario con dicho id o username, se debera hacer un select * y regresar todos los detalles de ese usuario, tambien genera un endpoint get donde se regresen todos los usuarios junto a sus datos. Ademas genera pruebas de bruno para verificar que el endpoint individual funciona y tambien el endpoint de todos los usuarios. Para el endpoint individual de bruno genera 2 tests, una donde se busque la id de usuario 3 y otra donde se busque el username skibidi

## Prompt 18

La variante C suena bien, internamente se leeria el body de la request? y de ahi se leeria la id o username?

## Prompt 19

usa la variante A, cuando se haga el select * no regreses la contrasena, las tests de bruno deben ser para todos los usuarios, una con la id 3 y la otra con el username skibidi

## Prompt 20

si adelante
