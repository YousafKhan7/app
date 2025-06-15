from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from dotenv import load_dotenv
from database import health_check, cleanup_database
import atexit

# Import route modules
from routes import users, accounting, business, customers, projects, files, websocket_routes

# Load environment variables
load_dotenv()

app = FastAPI(title="Full Stack App API", version="1.0.0")

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "https://*.vercel.app",   # Vercel deployments
        "http://*",              # Allow all HTTP domains
        "https://*",             # Allow all HTTPS domains
        "http://31.97.138.28",   # Your VPS IP
        "https://31.97.138.28",  # Your VPS IP with HTTPS
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register cleanup function for application shutdown
atexit.register(cleanup_database)

# Include routers
app.include_router(users.router, tags=["users"])
app.include_router(accounting.router, tags=["accounting"])
app.include_router(business.router, prefix="/settings", tags=["business"])
app.include_router(customers.router, tags=["customers"])
app.include_router(projects.router, tags=["projects"])
app.include_router(files.router, tags=["files"])
app.include_router(websocket_routes.router, tags=["websocket"])

# API Routes
@app.get("/")
async def root():
    return {"message": "Welcome to Full Stack App API"}

@app.get("/health")
async def health_check_endpoint():
    return health_check()

@app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(full_path: str):
    return {"path": full_path}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)