# Scout Deployment Configuration

## Environment Configuration

### Frontend (.env files)
- `.env.local` - Local development (already configured)
- `.env.production` - Production deployment (already configured)
- `.env` - Default configuration (defaults to localhost for development)

### Backend (.env)
- `GEMINI_API_KEY` - Required Google Gemini API key
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

## URLs and Endpoints

### Development
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production
- Frontend: https://scout-frontend.vercel.app
- Backend API: https://scout-np2t.onrender.com

## Configuration Features

### Automatic Fallbacks
- Frontend automatically detects environment and uses appropriate API URL
- Backend includes default CORS origins for common deployment scenarios
- All configurations include localhost fallbacks for development

### CORS Configuration
Backend automatically allows:
- `http://localhost:3000` (development frontend)
- `https://scout-frontend.vercel.app` (production frontend)
- `https://scout-np2t.onrender.com` (production API)
- Any additional origins specified in `ALLOWED_ORIGINS` environment variable

### API Configuration
- 10-second timeout for requests
- Request/response logging for debugging
- Error handling with network-specific messages
- Consistent API base URL management across frontend components

## Testing
Backend health check: `curl http://localhost:8000/health`
CORS test: `curl -H "Origin: http://localhost:3000" -X OPTIONS http://localhost:8000/health -i`
API endpoints test: `curl http://localhost:8000/preview-requests/`

## Recent Fixes
- Fixed API endpoint trailing slash issues (frontend now uses `/preview-requests/`, `/files/`, `/generated-images/`)
- Enhanced error handling and logging in frontend API service
- Verified CORS configuration works correctly between frontend and backend