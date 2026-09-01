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

## Prompt 28

Create or update `AGENTS.md` for this repository.

The goal is a compact instruction file that helps future OpenCode sessions avoid mistakes and ramp up quickly. Every line should answer: "Would an agent likely miss this without help?" If not, leave it out.

User-provided focus or constraints (honor these):


## How to investigate

Read the highest-value sources first:
- `README*`, root manifests, workspace config, lockfiles
- build, test, lint, formatter, typecheck, and codegen config
- CI workflows and pre-commit / task runner config
- existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- repo-local OpenCode config such as `opencode.json`

If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. Prefer reading the files that explain how the system is wired together over random leaf files.

Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.

## What to extract

Look for the highest-signal facts for an agent working in this repo:
- exact developer commands, especially non-obvious ones
- how to run a single test, a single package, or a focused verification step
- required command order when it matters, such as `lint -> typecheck -> test`
- monorepo or multi-package boundaries, ownership of major directories, and the real app/library entrypoints
- framework or toolchain quirks: generated code, migrations, codegen, build artifacts, special env loading, dev servers, infra deploy flow
- repo-specific style or workflow conventions that differ from defaults
- testing quirks: fixtures, integration test prerequisites, snapshot workflows, required services, flaky or expensive suites
- important constraints from existing instruction files worth preserving

Good `AGENTS.md` content is usually hard-earned context that took reading multiple files to infer.

## Questions

Only ask the user questions if the repo cannot answer something important. Use the `question` tool for one short batch at most.

Good questions:
- undocumented team conventions
- branch / PR / release expectations
- missing setup or test prerequisites that are known but not written down

Do not ask about anything the repo already makes clear.

## Writing rules

Include only high-signal, repo-specific guidance such as:
- exact commands and shortcuts the agent would otherwise guess wrong
- architecture notes that are not obvious from filenames
- conventions that differ from language or framework defaults
- setup requirements, environment quirks, and operational gotchas
- references to existing instruction sources that matter

Exclude:
- generic software advice
- long tutorials or exhaustive file trees
- obvious language conventions
- speculative claims or anything you could not verify
- content better stored in another file referenced via `opencode.json` `instructions`

When in doubt, omit.

Prefer short sections and bullets. If the repo is simple, keep the file simple. If the repo is large, summarize the few structural facts that actually change how an agent should work.

If `AGENTS.md` already exists at `\\wsl.localhost\Ubuntu\home\adam\Code\CIICCTE-server`, improve it in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims, and reconcile it with the current codebase.

## Prompt 29

Ahora para el frontend, a lo largo de la web app la estetica tiene que ser similar en este caso todos los componentes deben tener una medida en pixeles multiplo de 8, el tema es claro, por lo que el fondo debe ser blanco, elementros principales como botones, o textos relevantes blue-700, y elementos como lineas o border neutral-500 pues se esta usando talwind, la web app esta disenada para computadoras de escritorio o laptops por lo que no se creara una version responsive, y se va a trabajar por lo cual para mantener una codebase mantenible lo ideal es crear componentes separados los cuales cargar sobre divs dedicados a ciertas screens. Dicho eso agrega como dependencia a react router con bun, despues crea componentes vacios con uan estructura similar a la de App.tsx llamados DashobardScreen, DashboardSidebarComponent, DashobardMainContentComponent, DashboardTelemetryComponent, DashboardLinuxUsersComponent. Y configurando las rutas de react Router haz que DashboardScreen sea la ruta por defecto.

## Prompt 30

1.Dashboard, Screen y aparte components

## Prompt 31

Okay, para el frontend vamos a trabajar con la nocion de una spa, donde desde App.tsx vamos a tener algunas ¨screens¨ como login, dashboard, entre otros. Estas screen son de proposito especifico es decir login solo se va a mostrar cuando un usuario no esta autenticado y el resto del tienpo se va a tener la screen de dashboard cargada. La screen de dashboard sera el hub central para mostrar contenido y el diseño inmutable de esa screen consiste de que dashboard screen sea un comoponente vacio con un div que tome todo el espacio del viewport, este debe ser fijo y usar constraints de justify-center y display flex. Dentro de dicho div, en el lado lateral izquierdo tomando todo el espacio vertical se colocara el componente de DashboardSidebar (este componente debe tomar ese espacio, alinear las cosas con flex-col y justify-center), y tomando el resto del espacio disponible estara el componente DashboardMainContentComponent, este componente servira como proxy para cargar otros componentes. Para aclarar por el momento no crees la screen de login, solo adecua la screen de Dashboard para cumplir estos nuevos requerimientos y tambien adecua los componentes de dashboarSidebarComponent y dashboardMainContentComponent.

## Prompt 32

Sigue la version sin side effects, usa overflow-auto, manten las ux guidelines sobre la alineacion en base a multiplos de 8, no recuerdo solicitar la reacion de algo llamado header dashboard por lo cual si es contenido generado como boilerplate remuevelo, unicamente se requieren los componentes/divs estilizados pero sin contenido

## Prompt 33

Procede pa

## Prompt 34

Okay ahora crea componentes llamados DasboardTopComponent, DashboardCenterComponent, DashboardBottomComponent y DashboardCenterButtonComponent. El componente Top debera ir arnclado en la parte superior de la sidebar, el bottom component debe ir anclado en la parte infereior del componente y el center component debe ir en medio de top y bottom components con separacion entre ellos. El top component esta dedicado a mostrar detalles esteticos como CIICCTE y/o Panel web, el center component esta planeado para contener multiples buttons los cuales al ser presionados cargaran diferentes secciones dentro del main component y el bottom component contendra detalles como el username, rol de acceso, boton de configuracion y boton para hacer logout. Por el momento solo crea los componentes de top, center, bottom y el centerButtonComponent con sus detalles de styling.

## Prompt 35

Por el momento solo manten el componete vacio pero estilizado, tambien remueve la seccion de Notas y Estructura del repositorio del Readme

## Prompt 36

for the sidebar componentes such as the top, center, bottom and buttosn components remove the 8px multiple padding constraint and isntead make them take fill the horizontal space

## Prompt 37

SI

## Prompt 38

procede

## Prompt 39

now remove the left and right border from the sidebar innercomponents. Also For special text like for the CIICCTE word use text-4xl and blue 700, for Titles or sidebarbuttons use text-2xl and regular black, for standard text use text-xl. And create a folder inside components named Sidebar and place existing sidebarcopmonents and future sidebar components there removing the Dashbiard and DashboardSidebar prefix from the files, also create a component named TopInnerComponent that has the word CIICCTE as the text-4xl thing and below it the words Web Panel in the text-2xl styling. For the center components make it so the buttonComponent has a couple of presets: Dashboard,  Gestion Usuarios, Gestion Linux, Gestion Docker. For the bottom component create a component named BottomInnerComponent that has a text saying usuario which later will show the actual username, below that add a text saying the role type (usuario, admin and also create a new type of styling where textl will be smaller than regular text and will have the color neutral-700), add the neutral-700 styling to the role text, and add a button saying Cerrar sesion, right now only this is only a styling phase so besides that dont add weird functionality please :(

## Prompt 40

Remueve el borde para los innerComponent y comienza

## Prompt 41

okay now center vertically and horizontally the contents of the elements inside all the sidebar components and add padding to them so the texts are not touching the borders, tambien agrega hover:opacity-90 y hover:cursor cuando se hoverea el mouse sobre los botones

## Prompt 42

En el top component aumenta el padding interno para que las palabras CIICCTe y WebPanel no se corten por el borderdel top component, todos los botones dentro del center componet van centrados en el center, estos botones deben llenar todo el espacio horizontal el padding solo debe ser vertical, demas incrementa el padding interno de los botons. Para el bottom component usa un div donde al mismo nivel y de manera hotizontal se encuentre el usernam#rol ejemplo: usuario#admin o skibidi#user, el boton de cerrar sesion debe ocuor todo el espacio horixontal y el texto debe ser mas pequeño, tambien cambia el estilo del texto CIICCTE a blue600

## Prompt 43

Utiliza la solucion de min-h + py, para lo del padding usa px-2

## Prompt 44

Okay ya repense el diseño, migra los textos de top component al inner bottom component, pero agregalos  arriba de usuario@rol en el bottom component. Una vez hecho esto remueve los top components, y unicamente existira el center component del sidebar y el bottom component. Tambien renombra el center component a main copmonent del sidebar, todos los botones dentro del maincopmonent deberan ser acomodados en orden y no centrados verticalmente, adecua los botones a usar pt o pb y no px, py y gap. Tambien adecua los tamaños de letra a algo similar a los del bottom component, y en CIICTE web panel alinea el texto de "web panel para que verticalmente este alineado con el fondo y no flotando a nivel central del texto CIICTE por la diferencia de tamaño

## Prompt 45

Los mainbutton components deberan remover los border pero ahora seran rounded-lg y tendra una shadow. Por el momento usa text-lg, a partir de ahora en lugar de blue-600 se usara sky-400.

## Prompt 46

ive changed the styling a little bit, can you change the border color to neutral-600,  also for the sidebar main component buttons can you add a 4 gap between each other, and also can you make it so the shadow property is not only visible during the hover but also under regular cirucmstances, and remove the top and bottom borders from this components. And make the button text color neutral-600 and text-lg

## Prompt 47

No toques bottom component solo los elementos mencionados dentro de sidebarMainComponent

## Prompt 48

Hice cambios al frontend de manera manual, actualiza el agents.md para reflejar las design guideliness que sigue el proyecto actualmente, verifica si el readme refleja el estado actual del repo.

## Prompt 49

Sky-400 como color para elementos importantes, neutral-300 para bordes, el tamaño horizontalde los botones siendo de  9/10 es solo para los botones de la sidebar pero puede ser usado inicialmente para prototipar, los elementos rounded deben ser lg para mantener consistencia, y el texto de CIICCtE/web panel fue removido del proyecto.

## Prompt 50

Okay, ahora vienen multiples procesos nuevos, para la sidebar cuando un boton/componente esta activo el color de dicho boton dbe de ser de bg-sky-700, por default la seccion activa sera la de DAshboardTelemetryComponent la cual coresponde al dashboard. Dicho dashboard debera llamar al endpoint del backend encargado de mandar datos de las especificaciones del servidor, se debera crear un folder llamado folder donde se almacenaran los componentes del mismo, se creara el componente de "card" para mostrar de manera separada los detalles del CPU, GPu y la memoria, estas cards seran almacenadas dentro de un div y presentadas en lo que anteriormente era el DashoardTelmetryCOmponent el cual Ahora se llamara DAshboardComponent. Los tipos de letra, color y elementos esteticos de las cards seran rounded-lg con border-neutral-300, los detalles de CPU,gpu y memoria vienen en formato json y pueden ser representados mediante uan table dentro de cada card. Tambien se creara un Folder para LinuxUsers donde dashboardlinuxusers sera renombrado a LinuxUsersComponent, en el se tendra un div centrado y centrando los child items, y se creara una lista donde pro cada elemento de la request recibida se tendra un div tomando todo el espacio horizontal, dentro de el habran dos divs, uno alineado a la izquierda y teniendo los detalles de la request, y del lado derecho del div alargo se colocara el otro div el cual tendra 1 boton con el texto gestionar que por el momento no hara nada

## Prompt 51

Como estas Cards pertenecen al dashboard iran dentro de la carpeta dashboard, las cards mostraran los datos y si ocurre un error este se logeara en la terminal pero en la card se mostrara el texto: Algo salio mal, consulta los logs. Para linux users compnent se deben mostrar todos los elementos regresados  y el orden by username funciona bien
