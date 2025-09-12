from fastapi import APIRouter
from typing import Dict, Any

from ..core.database import memory_db

router = APIRouter()

@router.get("/health")
def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "scout-backend",
        "uploaded_files_count": len(memory_db["uploaded_files"]),
        "generated_images_count": len(memory_db["generated_images"])
    }