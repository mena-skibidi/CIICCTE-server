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
