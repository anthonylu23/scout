import uvicorn
import time
import uuid
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from typing import Optional

from .models import PreviewRequest, CameraSettings, PreviewRequests, UploadResponse
from .services import generation_service

app = FastAPI(title="Scout Backend", version="1.0.0")

# CORS middleware
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Memory database
memory_db = {
    "preview_requests": [],
    "uploaded_files": {},  # Store uploaded image files
    "generated_images": {}  # Store generated images
}

# Background image generation task
async def generate_image_background(preview_request_index: int, file_data: dict, camera_settings: dict):
    """Background task to generate image for a preview request"""
    try:
        print(f"🎨 Starting background image generation for request index {preview_request_index}")
        
        # Update status to generating
        memory_db["preview_requests"][preview_request_index].generation_status = "generating"
        
        # Generate image using the service
        generation_result = await generation_service.generate_image_from_screenshot(
            image_data=file_data["data"],
            camera_settings=camera_settings
        )
        
        if generation_result and generation_result.get("success"):
            print(f"✅ Image generation successful for request index {preview_request_index}")
            
            # Store generated image if we have image data
            if generation_result.get("generated_image_data"):
                generated_image_id = generation_result["generated_image_id"]
                file_path = generation_result.get("file_path")
                
                memory_db["generated_images"][generated_image_id] = {
                    "data": generation_result["generated_image_data"],
                    "content_type": "image/png",
                    "generation_time": generation_result["generation_time"],
                    "preview_request_index": preview_request_index,
                    "file_path": file_path
                }
                print(f"💾 Stored generated image with ID: {generated_image_id}")
                
                # Update preview request with generated image info
                memory_db["preview_requests"][preview_request_index].generated_image_id = generated_image_id
                memory_db["preview_requests"][preview_request_index].generated_file_path = file_path
            
            # Store description if available
            if generation_result.get("description"):
                memory_db["preview_requests"][preview_request_index].generated_description = generation_result["description"]
            
            # Mark as completed
            memory_db["preview_requests"][preview_request_index].generation_status = "completed"
            
        else:
            print(f"❌ Image generation failed for request index {preview_request_index}")
            error_msg = generation_result.get("message", "Unknown error") if generation_result else "Generation service returned None"
            
            memory_db["preview_requests"][preview_request_index].generation_status = "failed"
            memory_db["preview_requests"][preview_request_index].generation_error = error_msg
            
    except Exception as e:
        print(f"💥 Exception in background generation: {e}")
        memory_db["preview_requests"][preview_request_index].generation_status = "failed"
        memory_db["preview_requests"][preview_request_index].generation_error = str(e)

# Routes
@app.get("/preview-requests", response_model=PreviewRequests)
def get_preview_requests():
    return PreviewRequests(preview_requests=memory_db["preview_requests"])

@app.post("/preview-requests", response_model=PreviewRequest)
def create_preview_request(preview_request: PreviewRequest):
    memory_db["preview_requests"].append(preview_request)
    return preview_request

@app.delete("/preview-requests/{request_id}")
def delete_preview_request(request_id: int):
    if 0 <= request_id < len(memory_db["preview_requests"]):
        deleted = memory_db["preview_requests"].pop(request_id)
        return {"success": True, "message": f"Deleted preview request {request_id}"}
    else:
        raise HTTPException(status_code=404, detail="Preview request not found")

@app.post("/upload-screenshot", response_model=UploadResponse)
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
        
        print(f"📁 Uploaded file: {file.filename} ({file_size} bytes) with ID: {file_id}")
        
        # Create PreviewRequest if camera settings provided
        if date and timeOfDay and focalLength is not None and weather:
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
            
            print(f"✨ Created PreviewRequest with file: {file.filename}")
            print(f"🎨 Triggering background image generation...")
            
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
        print(f"❌ Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.get("/uploaded-files")
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

@app.delete("/uploaded-files/{file_id}")
def delete_uploaded_file(file_id: str):
    """Delete an uploaded file"""
    if file_id in memory_db["uploaded_files"]:
        file_info = memory_db["uploaded_files"].pop(file_id)
        return {"success": True, "message": f"Deleted file: {file_info['filename']}"}
    else:
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/generated-images")
def get_generated_images():
    """Get list of generated images"""
    images = []
    for image_id, image_data in memory_db["generated_images"].items():
        images.append({
            "image_id": image_id,
            "content_type": image_data["content_type"],
            "generation_time": image_data["generation_time"],
            "preview_request_index": image_data["preview_request_index"],
            "file_path": image_data.get("file_path")
        })
    return {"generated_images": images, "count": len(images)}

@app.get("/generated-images/{image_id}")
def get_generated_image(image_id: str):
    """Retrieve a generated image by ID"""
    if image_id not in memory_db["generated_images"]:
        raise HTTPException(status_code=404, detail="Generated image not found")
    
    image_data = memory_db["generated_images"][image_id]
    return Response(
        content=image_data["data"],
        media_type=image_data["content_type"],
        headers={"Content-Disposition": f"inline; filename=generated_{image_id}.png"}
    )

@app.delete("/generated-images/{image_id}")
def delete_generated_image(image_id: str):
    """Delete a generated image"""
    if image_id not in memory_db["generated_images"]:
        raise HTTPException(status_code=404, detail="Generated image not found")
    
    memory_db["generated_images"].pop(image_id)
    return {"success": True, "message": f"Deleted generated image: {image_id}"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "scout-backend",
        "uploaded_files_count": len(memory_db["uploaded_files"]),
        "generated_images_count": len(memory_db["generated_images"])
    }