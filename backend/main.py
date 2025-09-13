"""
Main entry point for Render deployment.
This file allows Render to import the FastAPI app directly.
"""

from app.main import app

# This is the ASGI application that Render will use
application = app

if __name__ == "__main__":
    # For local development, still use run.py
    import uvicorn
    import os

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)