from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import shutil
from pathlib import Path

class QueryRequest(BaseModel):
    query: str

app = FastAPI(title="LegalView Simple API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create data directory if it doesn't exist
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

@app.get("/")
async def read_root():
    return {"message": "LegalView Simple API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Simple API running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a document file"""
    try:
        # Validate file type
        allowed_types = [".pdf", ".txt", ".doc", ".docx"]
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext not in allowed_types:
            raise HTTPException(status_code=400, detail=f"File type {file_ext} not supported")
        
        # Save file to data directory
        file_path = DATA_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "size": file_path.stat().st_size
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_documents(request: QueryRequest):
    """Query the RAG system"""
    try:
        # For now, return a simple response indicating the backend is working
        # but the full RAG system needs to be properly initialized
        return {
            "answer": f"I received your query: '{request.query}'. The backend is running, but the full RAG system needs to be properly initialized to provide document-based answers. Please check the backend logs for RAG initialization status.",
            "sources": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/documents")
async def list_documents():
    """List all uploaded documents"""
    try:
        files = []
        for file_path in DATA_DIR.glob("*"):
            if file_path.is_file():
                files.append({
                    "name": file_path.name,
                    "size": file_path.stat().st_size,
                    "type": file_path.suffix,
                    "uploaded": file_path.stat().st_mtime
                })
        return {"documents": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting LegalView Simple Backend...")
    print(f"📁 Data directory: {DATA_DIR.absolute()}")
    print(f"🌐 Server will run on: http://localhost:8001")
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8001)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("💡 Try using a different port or check if the port is available")
