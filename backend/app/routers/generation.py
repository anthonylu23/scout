from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ..models import PreviewRequest, PreviewRequests
from ..core.database import memory_db
from ..core.logging import log_info, log_error
from ..services import generation_service

router = APIRouter(prefix="/preview-requests", tags=["preview-requests"])


async def generate_image_background(preview_request_index: int, file_data: dict, camera_settings: dict):
    """Background task to generate image for a preview request"""
    try:
        log_info(f"Starting background image generation for request index {preview_request_index}")
        
        # Update status to generating
        memory_db["preview_requests"][preview_request_index].generation_status = "generating"
        
        # Generate image using the service
        generation_result = await generation_service.generate_image_from_screenshot(
            image_data=file_data["data"],
            camera_settings=camera_settings
        )
        
        if generation_result and generation_result.get("success"):
            log_info(f"Image generation successful for request index {preview_request_index}")
            
            # Store generated image if we have image data
            if generation_result.get("generated_image_data"):
                generated_image_id = generation_result["generated_image_id"]
                
                memory_db["generated_images"][generated_image_id] = {
                    "data": generation_result["generated_image_data"],
                    "content_type": "image/png",
                    "generation_time": generation_result["generation_time"],
                    "preview_request_index": preview_request_index,
                    "description": generation_result.get("description")
                }
                
                log_info(f"Stored generated image with ID: {generated_image_id}")
                
                # Update preview request with generated image info
                memory_db["preview_requests"][preview_request_index].generated_image_id = generated_image_id
            
            # Store description if available
            if generation_result.get("description"):
                memory_db["preview_requests"][preview_request_index].generated_description = generation_result["description"]
            
            # Mark as completed
            memory_db["preview_requests"][preview_request_index].generation_status = "completed"
            
        else:
            log_error(f"Image generation failed for request index {preview_request_index}")
            error_msg = generation_result.get("message", "Unknown error") if generation_result else "Generation service returned None"
            memory_db["preview_requests"][preview_request_index].generation_status = "failed"
            memory_db["preview_requests"][preview_request_index].generation_error = error_msg
            
    except Exception as e:
        log_error(f"Exception in background generation for request {preview_request_index}", e)
        memory_db["preview_requests"][preview_request_index].generation_status = "failed"
        memory_db["preview_requests"][preview_request_index].generation_error = str(e)


@router.get("/", response_model=PreviewRequests)
def get_preview_requests():
    return PreviewRequests(preview_requests=memory_db["preview_requests"])


@router.post("/", response_model=PreviewRequest)
def create_preview_request(preview_request: PreviewRequest):
    memory_db["preview_requests"].append(preview_request)
    return preview_request


@router.delete("/{request_id}")
def delete_preview_request(request_id: int):
    if 0 <= request_id < len(memory_db["preview_requests"]):
        deleted = memory_db["preview_requests"].pop(request_id)
        return {"success": True, "message": f"Deleted preview request {request_id}"}
    else:
        raise HTTPException(status_code=404, detail="Preview request not found")