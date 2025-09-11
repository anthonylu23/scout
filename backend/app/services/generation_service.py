import os
import time
import uuid
import base64
from io import BytesIO
from typing import Optional, Dict, Any
from pathlib import Path
from google import genai
from ..core.config import GEMINI_API_KEY
from ..core.prompt import prompt
from PIL import Image

class ImageGenerationService:
    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = "gemini-2.5-flash-image-preview"  # Use stable model instead
        
        # Set up Downloads folder for saving generated images
        self.downloads_folder = Path.home() / "Downloads" 
        self.downloads_folder.mkdir(exist_ok=True)
        print(f"📁 Generated images will be saved to: {self.downloads_folder}")
    
    def save_generated_image_to_disk(self, image_data: bytes, image_id: str) -> str:
        """Save generated image to Downloads folder and return file path"""
        try:
            # Handle different data formats
            if isinstance(image_data, str):
                # Base64 string
                decoded_data = base64.b64decode(image_data)
                image = Image.open(BytesIO(decoded_data))
            elif isinstance(image_data, bytes):
                # Could be base64 bytes or raw image bytes
                try:
                    # Try as raw bytes first
                    image = Image.open(BytesIO(image_data))
                except Exception:
                    # If that fails, try decoding as base64
                    decoded_data = base64.b64decode(image_data)
                    image = Image.open(BytesIO(decoded_data))
            else:
                raise ValueError(f"Unsupported image data type: {type(image_data)}")
            
            # Save the image
            file_path = self.downloads_folder / f"{image_id}.png"
            image.save(file_path)
            print(f"💾 Saved generated image to: {file_path}")
            return str(file_path)
            
        except Exception as e:
            print(f"❌ Failed to save image to disk: {e}")
            return None
        
    async def generate_image_from_screenshot(
        self, 
        image_data: bytes, 
        camera_settings: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Generate an image based on screenshot and camera settings
        Returns dict with generated image data and metadata, or None if generation fails
        """
        try:
            print(f"🎨 Starting image generation with model: {self.model}")
            
            # Convert bytes to PIL Image
            image = Image.open(BytesIO(image_data))
            
            # Format the prompt with camera settings
            formatted_prompt = prompt.format(
                date=camera_settings.get('date', '2024-12-15'),
                time_of_day=camera_settings.get('timeOfDay', '12'),
                focal_length=camera_settings.get('focalLength', '50'),
                weather=camera_settings.get('weather', 'clear')
            )
            
            print("📸 Making Gemini API request for image generation...")
            
            # Make API request to Gemini
            response = self.client.models.generate_content(
                model=self.model,
                contents=[
                    image,
                    formatted_prompt
                ]
            )
            
            print("✅ Response received from Gemini")
            
            # Process response - look for generated images or descriptive text
            result = {
                "success": False,
                "generated_image_data": None,
                "generated_image_id": None,
                "description": None,
                "generation_time": time.time()
            }
            
            for part in response.candidates[0].content.parts:
                if part.text is not None:
                    print("📝 Generated description received")
                    result["description"] = part.text
                    print("Description: ", result["description"])
                    result["success"] = True
                    
                elif part.inline_data is not None:
                    print("🖼️ Generated image detected!")
                    
                    # Generate unique ID for generated image
                    generated_id = str(uuid.uuid4())
                    
                    # Get the raw image data (should be bytes)
                    raw_image_data = part.inline_data.data
                    
                    # Save image to Downloads folder
                    file_path = self.save_generated_image_to_disk(raw_image_data, generated_id)
                    
                    # Store the generated image data and file path
                    result["generated_image_data"] = raw_image_data
                    result["generated_image_id"] = generated_id
                    result["file_path"] = file_path
                    result["success"] = True
                    
                    print(f"💾 Generated image stored with ID: {generated_id}")
                    print(f"📊 Image data type: {type(raw_image_data)}, size: {len(raw_image_data) if isinstance(raw_image_data, (bytes, str)) else 'unknown'}")
            
            if result["success"]:
                print(f"🎉 Image generation completed successfully")
                return result
            else:
                print("⚠️ No content generated in response")
                return None
                
        except Exception as e:
            print(f"❌ Image generation failed: {e}")
            
            if "429" in str(e) or "resource exhausted" in str(e).lower():
                print("⏱️ Rate limit hit - generation will be retried later")
                return {
                    "success": False,
                    "error": "rate_limit",
                    "message": "Rate limit exceeded, try again later",
                    "retry_after": 60
                }
            elif "quota" in str(e).lower():
                print("💳 Quota exceeded - check API billing")
                return {
                    "success": False,
                    "error": "quota_exceeded", 
                    "message": "API quota exceeded"
                }
            else:
                return {
                    "success": False,
                    "error": "generation_failed",
                    "message": str(e)
                }

# Global instance
generation_service = ImageGenerationService()