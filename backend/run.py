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
    print("   - DELETE /generated-images/{id} - Delete generated image")
    uvicorn.run(app, host="0.0.0.0", port=8000)