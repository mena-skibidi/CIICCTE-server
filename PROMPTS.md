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

## Prompt 21

Al crear un usuario con el metodo post, regresa el codigo 200 para confirmar la cracion correcta del usuario. Cuando se modifica un usuario mediante el metodo PUT tambien regresa un codigo 200 si esta se completa exitosamente. Al correr la prueba put_user_role_change y modificar el "roles_id" del usuario "tsahur", se recibe una peticion de codigo 200, sin embargo la operacion no se lleva acabo identifica si el problema yace en el datamodel para esta operacion no soportando el atributo de rol, si algo ocurre a nivel de insercion en la db y agrega un valor de http correcto en caso de que la operacion no sea exitosa

## Prompt 22

Agrega un failsafe donde si el usuario se llamada admin el endpoint put de actualizar los datos de los usuario no pueda editar su rol, tambien actualizada la estructura del repo en el readme, por ultimo actualizado el archivo v3.sql dentro de drawsql para que refleje la adicion de la tabla de linux_user gestionada por sqlmodel y las relaciones con users, una vez terminado eso renombra el archivo a v4.sql

## Prompt 23

Okay, ahora en el area de telemetry crea un endpoint get llamado sync_linux_users el cual al recibir una peticion correra la unfcion de get_linux_users y almacenara los usuariso detectados en la db en la tabla de linux_users, para el router de telemetry usa el prefijo /api/telemetry. Crea una test de bruno para llamar a sync_linux_users y otra para pedir todos los usuarios de linux

## Prompt 24

cuando se corre lo de get_linux_users saltarse los usuarios que ya este en la lista solo agregar los nuevos, para usar el sistema no es necesario que un user este ligado a un linux_user por lo que el campo puede ser opcional, para get_linux_user como endpoint este tiene que regresar los detalles de la db que hacen referencia a linux users, por lo que al llamar el endpoint simplemente se debera hacer la query mientras que el endpoint de sync_linux_users o mas bien la funcion que llamada para sincronizarlos debe llamarse acada vez que se llame el endpoint de sync)linux_users y en el proceso de db_setup tras crear el usuario de admin para que cuando se acceda al panel web por primera vez la seccion de linux_users ya se encuentre populada

## Prompt 25

El sistema esta disenado para unicamente correr en linux, ahonda mas en lo del upsert y en los detalles sin resolver

## Prompt 26

1. uid, 2. saltarse el home_dir, 3. agregable despues por defualt None, 4. ordernar por username, 5. no la prueba debe ser separada pues esta se correra manualmente, 6. si

## Prompt 27

Procede
