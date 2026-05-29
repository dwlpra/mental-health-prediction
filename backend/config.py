import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

_api_keys_raw = os.environ.get("LLM_API", "")
LLM_API_KEYS = [k.strip() for k in _api_keys_raw.split(",") if k.strip()]
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile")
MODEL_DIR = PROJECT_ROOT / "models"

# CORS: tambah domain Cloudflare di .env kalau sudah punya
# Contoh: CORS_ORIGINS=http://localhost:5173,https://mental.yourdomain.com
_cors_env = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
CORS_ORIGINS = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]
