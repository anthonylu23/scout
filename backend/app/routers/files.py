from fastapi import APIRouter, HTTPException, File, UploadFile, Form, BackgroundTasks
from typing import Optional
import time
import uuid

from ..models import UploadResponse
from ..core.database import memory_db
from ..core.logging import log_info, log_error
from .generation import generate_image_background

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=UploadResponse)
async def upload_screenshot(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    date: Optional[str] = Form(None),
    timeOfDay: Optional[str] = Form(None), 
    focalLength: Optional[int] = Form(None),
    weather: Optional[str] = Form(None)
):
    """Upload and store screenshot file with automatic image generation"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Store in memory database
        memory_db["uploaded_files"][file_id] = {
            "filename": file.filename,
            "content_type": file.content_type,
            "data": file_content,
            "size": file_size,
            "upload_time": time.time()
        }
        
        log_info(f"Uploaded file: {file.filename} ({file_size} bytes) with ID: {file_id}")
        
        # Create PreviewRequest if camera settings provided
        if date and timeOfDay and focalLength is not None and weather:
            from ..models import PreviewRequest, CameraSettings
            
            camera_settings = CameraSettings(
                date=date,
                timeOfDay=timeOfDay,
                focalLength=focalLength,
                weather=weather
            )
            
            preview_request = PreviewRequest(
                screenshot=file_id,
                cameraSettings=camera_settings,
                upload_time=time.time(),
                file_id=file_id,
                filename=file.filename,
                generation_status="pending"
            )
            
            memory_db["preview_requests"].append(preview_request)
            preview_request_index = len(memory_db["preview_requests"]) - 1
            
            log_info(f"Created PreviewRequest with file: {file.filename}")
            log_info("Triggering background image generation...")
            
            # Start background image generation
            camera_settings_dict = {
                "date": date,
                "timeOfDay": timeOfDay,
                "focalLength": focalLength,
                "weather": weather
            }
            
            background_tasks.add_task(
                generate_image_background,
                preview_request_index,
                memory_db["uploaded_files"][file_id],
                camera_settings_dict
            )
            
            return UploadResponse(
                success=True,
                file_id=file_id,
                message=f"File uploaded, preview request created, and image generation started: {file.filename}",
                file_size=file_size
            )
        else:
            return UploadResponse(
                success=True,
                file_id=file_id,
                message=f"File uploaded successfully: {file.filename}",
                file_size=file_size
            )
        
    except HTTPException:
        raise
    except Exception as e:
        log_error("Error uploading file", e)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


@router.get("/")
def get_uploaded_files():
    """Get list of uploaded files"""
    files = []
    for file_id, file_data in memory_db["uploaded_files"].items():
        files.append({
            "file_id": file_id,
            "filename": file_data["filename"],
            "size": file_data["size"],
            "content_type": file_data["content_type"],
            "upload_time": file_data["upload_time"]
        })
    return {"uploaded_files": files, "count": len(files)}


@router.delete("/{file_id}")
def delete_uploaded_file(file_id: str):
    """Delete an uploaded file"""
    if file_id in memory_db["uploaded_files"]:
        file_info = memory_db["uploaded_files"].pop(file_id)
        return {"success": True, "message": f"Deleted file: {file_info['filename']}"}
    else:
        raise HTTPException(status_code=404, detail="File not found")