from pydantic import BaseModel
from typing import Optional

class UploadResponse(BaseModel):
    success: bool
    file_id: str
    message: str
    file_size: Optional[int] = None