import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    app_name: str = "DevOps SRE AI Investigation Engine"
    app_version: str = "1.0.0"
    port: int = int(os.getenv("PORT", "8000"))
    spring_boot_url: str = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", "devops-ai-internal-key-2026")
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/devops_incident_db")
    model_provider: str = os.getenv("MODEL_PROVIDER", "GEMINI") # GEMINI, OPENAI, OLLAMA, MOCK
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    ollama_host: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")

settings = Settings()
