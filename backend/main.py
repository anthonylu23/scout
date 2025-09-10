import uvicorn
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import time
import uuid

app = FastAPI()
origins = [
    "http://localhost:3000"
]

class CameraSettings(BaseModel):
    date: str
    timeOfDay: str
    focalLength: int
    weather: str

class PreviewRequest(BaseModel):
    screenshot: str  # File ID or file path
    cameraSettings: CameraSettings
    upload_time: Optional[float] = None
    file_id: Optional[str] = None
    filename: Optional[str] = None

class PreviewRequests(BaseModel):
    preview_requests: List[PreviewRequest]

class UploadResponse(BaseModel):
    success: bool
    file_id: str
    message: str
    file_size: Optional[int] = None

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

memory_db = {
    "preview_requests": [],
    "uploaded_files": {}  # Store uploaded image files
}

@app.get("/preview-requests", response_model=PreviewRequests)
def get_preview_requests():
    return PreviewRequests(preview_requests=memory_db["preview_requests"])

@app.post("/preview-requests", response_model=PreviewRequest)
def create_preview_request(preview_request: PreviewRequest):
    memory_db["preview_requests"].append(preview_request)
    return preview_request

@app.delete("/preview-requests/{request_id}", response_model=PreviewRequest)
def delete_preview_request(request_id: int):
    memory_db["preview_requests"].pop(request_id)
    return memory_db["preview_requests"][request_id]

@app.post("/upload-screenshot", response_model=UploadResponse)
async def upload_screenshot(
    file: UploadFile = File(...),
    date: Optional[str] = Form(None),
    timeOfDay: Optional[str] = Form(None), 
    focalLength: Optional[int] = Form(None),
    weather: Optional[str] = Form(None)
):
    """Upload and store screenshot file in memory storage"""
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
                screenshot=file_id,  # Use file_id as reference
                cameraSettings=camera_settings,
                upload_time=time.time(),
                file_id=file_id,
                filename=file.filename
            )
            
            memory_db["preview_requests"].append(preview_request)
            print(f"✨ Created PreviewRequest with file: {file.filename}")
            
            return UploadResponse(
                success=True,
                file_id=file_id,
                message=f"File uploaded and preview request created: {file.filename}",
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
    """Get list of currently stored uploaded files"""
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
    """Delete a specific uploaded file from memory storage"""
    if file_id in memory_db["uploaded_files"]:
        file_info = memory_db["uploaded_files"].pop(file_id)
        return {"success": True, "message": f"Deleted file: {file_info['filename']}"}
    else:
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "scout-backend",
        "uploaded_files_count": len(memory_db["uploaded_files"])
    }

if __name__ == "__main__":
    print("🚀 Starting Scout Backend Server...")
    print("📋 Available endpoints:")
    print("   - GET  /health - Health check")
    print("   - GET  /preview-requests - Get all preview requests") 
    print("   - POST /preview-requests - Create preview request")
    print("   - POST /upload-screenshot - Upload image file")
    print("   - GET  /uploaded-files - List uploaded files")
    print("   - DELETE /uploaded-files/{id} - Delete uploaded file")
    print("   - DELETE /preview-requests/{id} - Delete preview request")
    uvicorn.run(app, host="0.0.0.0", port=8000)