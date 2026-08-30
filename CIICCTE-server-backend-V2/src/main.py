from contextlib import asynccontextmanager

from db import router as db_router
from db_setup import db_setup
from fastapi import FastAPI
from telemetry import router as telemetry_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_setup()
    yield


server = FastAPI(lifespan=lifespan)
server.include_router(db_router)
server.include_router(telemetry_router)
