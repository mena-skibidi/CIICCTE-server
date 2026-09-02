from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import router as db_router
from db_setup import db_setup
from telemetry import router as telemetry_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_setup()
    yield


server = FastAPI(lifespan=lifespan)
server.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
server.include_router(db_router)
server.include_router(telemetry_router)
