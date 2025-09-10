from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

# Memory database will be imported from main
memory_db = None

def set_memory_db(db):
    global memory_db
    memory_db = db

@router.get("/health")
def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "scout-backend",
        "uploaded_files_count": len(memory_db["uploaded_files"]) if memory_db else 0,
        "generated_images_count": len(memory_db["generated_images"]) if memory_db else 0
    }