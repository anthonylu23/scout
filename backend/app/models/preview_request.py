from pydantic import BaseModel
from typing import List, Optional

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
    # Generated image fields
    generated_image_id: Optional[str] = None
    generated_description: Optional[str] = None
    generated_file_path: Optional[str] = None  # Local file path in Downloads
    generation_status: Optional[str] = "pending"  # pending, generating, completed, failed
    generation_error: Optional[str] = None

class PreviewRequests(BaseModel):
    preview_requests: List[PreviewRequest]