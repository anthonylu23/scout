from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from ..core.database import memory_db

router = APIRouter(prefix="/generated-images", tags=["generated-images"])


@router.get("/")
def get_generated_images():
    """Get list of generated images"""
    images = []
    for image_id, image_data in memory_db["generated_images"].items():
        images.append({
            "image_id": image_id,
            "content_type": image_data["content_type"],
            "generation_time": image_data["generation_time"],
            "preview_request_index": image_data["preview_request_index"],
            "description": image_data.get("description")
        })
    return {"generated_images": images, "count": len(images)}


@router.get("/{generated_image_id}")
def get_generated_image(generated_image_id: str):
    """Retrieve a generated image by ID as raw bytes"""
    if generated_image_id not in memory_db["generated_images"]:
        raise HTTPException(status_code=404, detail="Generated image not found")
    
    image_data = memory_db["generated_images"][generated_image_id]
    raw_bytes = image_data["data"]
    
    # Ensure we're serving raw bytes
    if not isinstance(raw_bytes, bytes):
        if isinstance(raw_bytes, str):
            # If it's still base64, decode it
            try:
                import base64
                raw_bytes = base64.b64decode(raw_bytes)
            except Exception:
                raise HTTPException(status_code=500, detail="Invalid image data format")
    
    return Response(
        content=raw_bytes,
        media_type="image/png",
        headers={
            "Content-Disposition": f"inline; filename=generated_{generated_image_id}.png",
            "Cache-Control": "public, max-age=3600",
            "Content-Length": str(len(raw_bytes))
        }
    )


@router.get("/{generated_image_id}/info")
def get_generated_image_info(generated_image_id: str):
    """Get debug info about a generated image"""
    if generated_image_id not in memory_db["generated_images"]:
        raise HTTPException(status_code=404, detail="Generated image not found")
    
    image_data = memory_db["generated_images"][generated_image_id]
    raw_data = image_data["data"]
    
    return {
        "generated_image_id": generated_image_id,
        "data_type": str(type(raw_data)),
        "data_size": len(raw_data) if isinstance(raw_data, (bytes, str)) else "unknown",
        "is_bytes": isinstance(raw_data, bytes),
        "is_string": isinstance(raw_data, str),
        "first_10_chars": str(raw_data[:10]) if isinstance(raw_data, (bytes, str)) else "N/A",
        "content_type": image_data.get("content_type"),
        "has_description": bool(image_data.get("description"))
    }


@router.get("/{generated_image_id}/details")
def get_generated_image_details(generated_image_id: str):
    """Retrieve generated image details including description and metadata"""
    if generated_image_id not in memory_db["generated_images"]:
        raise HTTPException(status_code=404, detail="Generated image not found")
    
    image_data = memory_db["generated_images"][generated_image_id]
    return {
        "generated_image_id": generated_image_id,
        "content_type": image_data["content_type"],
        "generation_time": image_data["generation_time"],
        "preview_request_index": image_data["preview_request_index"],
        "description": image_data.get("description"),
        "image_url": f"/generated-images/{generated_image_id}"
    }


@router.delete("/{generated_image_id}")
def delete_generated_image(generated_image_id: str):
    """Delete a generated image"""
    if generated_image_id not in memory_db["generated_images"]:
        raise HTTPException(status_code=404, detail="Generated image not found")
    
    memory_db["generated_images"].pop(generated_image_id)
    return {"success": True, "message": f"Deleted generated image: {generated_image_id}"}