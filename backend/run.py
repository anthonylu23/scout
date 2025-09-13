import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 Starting Scout Backend Server...")
    print("📋 Available endpoints:")
    print("   - GET  /health - Health check")
    print("   - GET  /preview-requests - Get all preview requests")
    print("   - POST /preview-requests - Create preview request")
    print("   - POST /upload-screenshot - Upload image file & auto-generate")
    print("   - GET  /uploaded-files - List uploaded files")
    print("   - DELETE /uploaded-files/{id} - Delete uploaded file")
    print("   - DELETE /preview-requests/{id} - Delete preview request")
    print("   - GET  /generated-images - List generated images")
    print("   - GET  /generated-images/{id} - Retrieve generated image")
    print("   - GET  /generated-images/{id}/details - Get image details with description")
    print("   - GET  /generated-images/{id}/info - Get debug info about image data")
    print("   - DELETE /generated-images/{id} - Delete generated image")

    # Use PORT environment variable for Render deployment, fallback to 8000 for local
    port = int(os.getenv("PORT", 8000))
    print(f"🔗 Starting server on port: {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)