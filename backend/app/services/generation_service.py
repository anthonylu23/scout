import time
import uuid
import base64
from io import BytesIO
from typing import Optional, Dict, Any
from google import genai
from PIL import Image

from ..core.config import GEMINI_API_KEY
from ..core.prompt import prompt
from ..core.logging import log_info, log_error, log_warning

class ImageGenerationService:
    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = "gemini-2.5-flash-image-preview"  # Use stable model instead
    
        
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
            log_info(f"Starting image generation with model: {self.model}")

            # Debug and validate image data before processing
            if not image_data:
                log_error("Image data is empty or None")
                return {
                    "success": False,
                    "error": "invalid_image_data",
                    "message": "No image data provided"
                }

            # Log image data characteristics
            log_info(f"Image data type: {type(image_data)}")
            log_info(f"Image data size: {len(image_data)} bytes")

            # Check if data starts with common image file headers
            if len(image_data) >= 4:
                header = image_data[:4]
                if header.startswith(b'\xff\xd8\xff'):
                    log_info("Detected JPEG image format")
                elif header.startswith(b'\x89PNG'):
                    log_info("Detected PNG image format")
                elif header.startswith(b'GIF8'):
                    log_info("Detected GIF image format")
                elif header.startswith(b'RIFF'):
                    log_info("Detected WebP image format")
                else:
                    log_warning(f"Unknown image format. Header: {header.hex()}")

            # Convert bytes to PIL Image with enhanced error handling
            try:
                # Try different approaches to handle potential encoding issues
                image_buffer = BytesIO(image_data)

                # First attempt: Direct PIL opening
                try:
                    image = Image.open(image_buffer)
                    # Verify the image can be loaded
                    image.verify()
                    # Re-open for actual use (verify() closes the image)
                    image_buffer.seek(0)
                    image = Image.open(image_buffer)
                    log_info(f"Successfully opened image: {image.format} {image.size} {image.mode}")
                except Exception as direct_error:
                    log_warning(f"Direct PIL opening failed: {direct_error}")

                    # Second attempt: Handle potential base64 encoding issues
                    try:
                        import base64
                        # Check if data might be base64 encoded (common in some deployment environments)
                        if isinstance(image_data, str):
                            decoded_data = base64.b64decode(image_data)
                        elif isinstance(image_data, bytes) and image_data.startswith(b'data:image'):
                            # Handle data URLs
                            header, encoded = image_data.split(b',', 1)
                            decoded_data = base64.b64decode(encoded)
                        else:
                            # Try to decode bytes as base64 in case of double encoding
                            decoded_data = base64.b64decode(image_data)

                        log_info(f"Attempting base64 decode, original size: {len(image_data)}, decoded size: {len(decoded_data)}")

                        image_buffer = BytesIO(decoded_data)
                        image = Image.open(image_buffer)
                        image.verify()
                        image_buffer.seek(0)
                        image = Image.open(image_buffer)
                        log_info(f"Successfully opened base64 decoded image: {image.format} {image.size} {image.mode}")

                    except Exception as base64_error:
                        log_warning(f"Base64 decode attempt failed: {base64_error}")
                        # Re-raise the original error
                        raise direct_error

            except Exception as img_error:
                log_error(f"Failed to open image with PIL: {img_error}")
                # Try to save raw data for debugging
                import tempfile
                import os
                try:
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.debug') as tmp:
                        tmp.write(image_data)
                        debug_path = tmp.name
                    log_info(f"Raw image data saved to: {debug_path}")
                except Exception as debug_error:
                    log_warning(f"Could not save debug data: {debug_error}")

                return {
                    "success": False,
                    "error": "invalid_image_format",
                    "message": f"Cannot process image data: {str(img_error)}"
                }
            
            # Format the prompt with camera settings
            formatted_prompt = prompt.format(
                date=camera_settings.get('date', '2024-12-15'),
                time_of_day=camera_settings.get('timeOfDay', '12'),
                focal_length=camera_settings.get('focalLength', '50'),
                weather=camera_settings.get('weather', 'clear')
            )
            
            log_info("Making Gemini API request for image generation...")
            
            # Make API request to Gemini
            response = self.client.models.generate_content(
                model=self.model,
                contents=[
                    image,
                    formatted_prompt
                ]
            )
            
            log_info("Response received from Gemini")
            
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
                    log_info("Generated description received")
                    result["description"] = part.text
                    
                    log_info("Description received", description=result["description"])
                    result["success"] = True
                    
                elif part.inline_data is not None:
                    log_info("Generated image detected!")
                    
                    # Generate unique ID for generated image
                    generated_id = str(uuid.uuid4())
                    
                    # Get the raw image data and ensure it's bytes
                    gemini_image_data = part.inline_data.data
                    
                    # Convert to raw bytes if it's base64 encoded
                    try:
                        if isinstance(gemini_image_data, str):
                            # It's base64 string, decode it
                            raw_image_bytes = base64.b64decode(gemini_image_data)
                            log_info(f"Decoded base64 string to {len(raw_image_bytes)} bytes")
                        elif isinstance(gemini_image_data, bytes):
                            # Check if it's base64-encoded bytes
                            try:
                                # Try to decode as base64 first
                                raw_image_bytes = base64.b64decode(gemini_image_data)
                                log_info(f"Decoded base64 bytes to {len(raw_image_bytes)} bytes")
                            except:
                                # It's already raw bytes
                                raw_image_bytes = gemini_image_data
                                log_info(f"Using raw bytes: {len(raw_image_bytes)} bytes")
                        else:
                            raise ValueError(f"Unexpected image data type: {type(gemini_image_data)}")
                            
                        # Validate that we have valid image bytes by trying to open with PIL
                        test_image = Image.open(BytesIO(raw_image_bytes))
                        test_image.verify()
                        log_info(f"Image validation successful: {test_image.format} {test_image.size}")
                        
                    except Exception as decode_error:
                        log_error("Failed to process image data", decode_error)
                        raw_image_bytes = gemini_image_data  # Fallback to original data
                    
                    # Store the RAW BYTES in memory for API serving
                    result["generated_image_data"] = raw_image_bytes
                    result["generated_image_id"] = generated_id
                    result["success"] = True
                    
                    log_info(f"Generated image stored with ID: {generated_id}")
                    log_info(f"Final stored data type: {type(raw_image_bytes)}, size: {len(raw_image_bytes)} bytes")
            
            if result["success"]:
                log_info("Image generation completed successfully")
                return result
            else:
                log_warning("No content generated in response")
                return None
                
        except Exception as e:
            log_error("Image generation failed", e)
            
            if "429" in str(e) or "resource exhausted" in str(e).lower():
                log_warning("Rate limit hit - generation will be retried later")
                return {
                    "success": False,
                    "error": "rate_limit",
                    "message": "Rate limit exceeded, try again later",
                    "retry_after": 60
                }
            elif "quota" in str(e).lower():
                log_error("Quota exceeded - check API billing")
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