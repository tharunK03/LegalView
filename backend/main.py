from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os
import shutil
from pathlib import Path
import sys
from typing import Optional

class QueryRequest(BaseModel):
    query: str
    document_filter: str = None  # Optional document name to filter by

# Add the parent directory to the path to import modules
sys.path.append(str(Path(__file__).parent.parent))

from modules.rag_chain import get_rag_chain
from modules.loader import load_document
from modules.splitter import split_documents
from modules.embeddings import get_embeddings
from langchain_community.vectorstores import FAISS
from config import VECTORSTORE_PATH

app = FastAPI(title="LegalView API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create data directory if it doesn't exist
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def resolve_document_source(filter_value: Optional[str]) -> Optional[str]:
    """
    Map a user-provided document filter to the stored source metadata value.
    Returns the relative path stored in the vector store (e.g. 'data/file.pdf')
    or None if no specific filter should be applied.
    """
    if not filter_value:
        return None
    candidate = filter_value.strip()
    if not candidate or candidate.lower() in {"all documents", "all"}:
        return None

    # Try to match against files in the data directory
    candidate_lower = candidate.lower()
    for path in DATA_DIR.glob("*"):
        if path.is_file():
            if candidate_lower == path.name.lower():
                return str(Path("data") / path.name)
            if candidate_lower in path.name.lower():
                return str(Path("data") / path.name)
    return None

# Initialize RAG chain
try:
    qa_chain = get_rag_chain()
    print("✅ RAG chain initialized successfully")
except Exception as e:
    print(f"❌ Error initializing RAG chain: {e}")
    print("⚠️ Starting backend without RAG chain - file uploads will work but queries won't")
    qa_chain = None

@app.get("/")
async def read_root():
    return {"message": "LegalView API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "rag_chain": qa_chain is not None}

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
        
        # Process the document
        try:
            docs = load_document(str(file_path))
            chunks = split_documents(docs)
            
            # Update vectorstore
            embeddings = get_embeddings()
            if os.path.exists(VECTORSTORE_PATH):
                vectorstore = FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)
                vectorstore.add_documents(chunks)
            else:
                vectorstore = FAISS.from_documents(chunks, embeddings)
            
            vectorstore.save_local(VECTORSTORE_PATH)
            
            return {
                "message": "File uploaded and processed successfully",
                "filename": file.filename,
                "chunks": len(chunks)
            }
            
        except Exception as e:
            # Remove the file if processing failed
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_documents(request: QueryRequest):
    """Query the RAG system"""
    if not qa_chain:
        raise HTTPException(status_code=500, detail="RAG chain not initialized")

    document_source = resolve_document_source(request.document_filter)
    if request.document_filter and not document_source:
        raise HTTPException(status_code=404, detail="Requested document not found")
    
    try:
        chain_to_use = qa_chain
        if document_source:
            chain_to_use = get_rag_chain(document_source=document_source)

        result = chain_to_use.invoke({"query": request.query})
        
        # Filter sources by document if specified
        sources = result.get("source_documents", [])
        if request.document_filter:
            sources = [
                doc for doc in sources 
                if request.document_filter in doc.metadata.get("source", "")
                or (document_source and doc.metadata.get("source") == document_source)
            ]
        
        return {
            "answer": result["result"],
            "sources": [
                {
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata
                }
                for doc in sources
            ],
            "document_filter": request.document_filter
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
                    "display_name": file_path.stem,  # Name without extension
                    "size": file_path.stat().st_size,
                    "type": file_path.suffix,
                    "uploaded": file_path.stat().st_mtime,
                    "path": str(file_path)
                })
        return {"documents": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_name}")
async def get_document_info(document_name: str):
    """Get information about a specific document"""
    try:
        file_path = DATA_DIR / document_name
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "name": file_path.name,
            "display_name": file_path.stem,
            "size": file_path.stat().st_size,
            "type": file_path.suffix,
            "uploaded": file_path.stat().st_mtime,
            "path": str(file_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{filename}/download")
async def download_document(filename: str):
    """Download a document"""
    try:
        file_path = DATA_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Document not found")
        
        from fastapi.responses import FileResponse
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type='application/octet-stream'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading document: {str(e)}")

@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    """Delete a document"""
    try:
        file_path = DATA_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Remove the file
        file_path.unlink()
        
        # Rebuild the vectorstore to remove the deleted document
        try:
            from ingest import main as ingest_main
            ingest_main()
            print(f"✅ Vectorstore updated after deleting {filename}")
        except Exception as e:
            print(f"⚠️ Warning: Could not update vectorstore after deletion: {e}")
        
        return {"message": f"Document {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting LegalView Backend...")
    print(f"📁 Data directory: {DATA_DIR.absolute()}")
    print(f"🔍 Vectorstore path: {VECTORSTORE_PATH}")
    print(f"🌐 Server will run on: http://localhost:8001")
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8001)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("💡 Try using a different port or check if the port is available")
