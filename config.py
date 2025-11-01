import os
from dotenv import load_dotenv

load_dotenv()

# AI API Configuration
AI_API_KEY = os.getenv("AI_API_KEY", "nil")
if not AI_API_KEY:
    raise ValueError("AI_API_KEY environment variable is required")

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
# Default to an available Gemini model (full model name expected by the SDK)
LLM_MODEL = os.getenv("LLM_MODEL", "models/gemini-2.5-flash")
VECTORSTORE_PATH = "vectorstore"
