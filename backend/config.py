import os
from dotenv import load_dotenv
from functools import lru_cache

# Load environment variables
load_dotenv()

class Settings:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/app")
        self.cors_origins = [
            "http://localhost:5173",  # Vite dev server
            "https://*.vercel.app",   # Vercel deployments
            "https://yourdomain.com", # Your custom domain
        ]

@lru_cache()
def get_settings():
    return Settings()
