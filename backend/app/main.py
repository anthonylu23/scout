import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, files, images, generation
from .core.logging import log_info

app = FastAPI(title="Scout Backend", version="1.0.0")

# Root endpoint for health checks and deployment verification
@app.get("/")
async def root():
    """Root endpoint - returns basic API information"""
    return {
        "message": "Scout Backend API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

# CORS middleware with robust configuration
def get_allowed_origins():
    # Get origins from environment variable
    env_origins = os.getenv("ALLOWED_ORIGINS", "")

    # Default origins for development and production
    default_origins = [
        "http://localhost:3000",  # Local development frontend
        "https://scout-frontend.vercel.app",  # Production frontend
        "https://scout-np2t.onrender.com",  # Production API
    ]

    if env_origins:
        # Split and clean environment origins
        origins = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
        # Combine with defaults (avoid duplicates)
        all_origins = list(set(origins + default_origins))
    else:
        all_origins = default_origins

    log_info(f"CORS allowed origins: {all_origins}")
    return all_origins

origins = get_allowed_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(files.router)
app.include_router(images.router)
app.include_router(generation.router)

log_info("Scout Backend initialized successfully")