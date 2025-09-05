import os
from dotenv import load_dotenv

load_dotenv()

# AI API Configuration
AI_API_KEY = os.getenv("AI_API_KEY", "nil")
if not AI_API_KEY:
    raise ValueError("AI_API_KEY environment variable is required")

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "gemini-1.5-flash"  # AI model
VECTORSTORE_PATH = "vectorstore"
