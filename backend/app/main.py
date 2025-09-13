import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, files, images, generation
from .core.logging import log_info

app = FastAPI(title="Scout Backend", version="1.0.0")

# CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
origins = [origin.strip() for origin in allowed_origins]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(files.router)
app.include_router(images.router)
app.include_router(generation.router)

log_info("Scout Backend initialized successfully")