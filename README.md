# Scout Maps

A full-stack interactive mapping application with AI-powered image generation and annotation tools.

## Overview

Scout Maps is a React-based mapping application that allows users to upload screenshots, annotate maps, and generate AI-powered images based on camera settings and environmental conditions using Google's Gemini AI.

## Project Structure

```
scout/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components organized by feature
│   │   │   ├── Camera/       # Camera controls and settings
│   │   │   ├── Map/          # Map view and annotation tools
│   │   │   └── UI/           # Reusable UI components
│   │   ├── services/         # API communication layer
│   │   ├── utils/            # Utility functions and constants
│   │   ├── hooks/            # Custom React hooks
│   │   └── styles/           # CSS styling
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── backend/                  # FastAPI backend server
│   ├── app/
│   │   ├── core/             # Core configuration and utilities
│   │   ├── models/           # Pydantic data models
│   │   ├── routers/          # API route handlers
│   │   └── services/         # Business logic services
│   ├── tests/                # Backend tests
│   ├── run.py               # Server entry point
│   └── requirements.txt      # Python dependencies
└── README.md
```

## Features

### Frontend

- **Interactive Mapping**: Powered by Mapbox GL JS with full pan, zoom, and search capabilities
- **Annotation Tools**: Pin placement, freehand drawing, and text annotations
- **Persistent Storage**: Annotations saved to browser localStorage
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error boundaries and user feedback

### Backend

- **RESTful API**: FastAPI-based REST API with automatic OpenAPI documentation
- **Image Upload**: Support for image file uploads with validation
- **AI Image Generation**: Integration with Google Gemini for AI-powered image generation
- **Memory Storage**: In-memory data storage for development
- **Structured Logging**: Comprehensive logging system for debugging and monitoring
- **Error Handling**: Robust error handling with detailed error responses

### AI Integration

- **Camera Settings**: Configure date, time of day, focal length, and weather conditions
- **Image Generation**: Generate images based on uploaded screenshots and camera settings
- **Real-time Processing**: Background task processing for image generation
- **Download Support**: Download generated images with intelligent filename generation

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- Mapbox account and access token
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY=your_gemini_api_key_here

# Run the server
python run.py
```

The backend server will run on http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
# Create .env file with:
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here

# Start development server
npm start
```

The frontend will run on http://localhost:3000

## API Documentation

The backend automatically generates API documentation available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

- `POST /files/upload` - Upload screenshot with camera settings
- `GET /preview-requests` - Get generation status and history
- `GET /generated-images/{id}` - Retrieve generated images
- `GET /health` - Health check endpoint

## Environment Variables

### Frontend (.env)

```
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

### Backend

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Testing

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
python -m pytest tests/
```

## License

This project is licensed under the MIT License.
