import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

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
    screenshot: Optional[str] #base64 encoded from frontend
    cameraSettings: CameraSettings

class PreviewRequests(BaseModel):
    preview_requests: List[PreviewRequest]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

memory_db = {
    "preview_requests": []
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
     