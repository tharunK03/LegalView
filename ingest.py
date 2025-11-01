from modules.loader import load_document
from modules.splitter import split_documents
from modules.embeddings import get_embeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from config import VECTORSTORE_PATH
import sys
import os
import glob

def ingest_file(file_path):
    """Ingest a single file and return its chunks"""
    print(f"📄 Processing: {file_path}")
    try:
        docs = load_document(file_path)
        chunks = split_documents(docs)
        print(f"   ✅ Split into {len(chunks)} chunks")
        return chunks
    except Exception as e:
        print(f"   ❌ Error processing {file_path}: {str(e)}")
        return []

def ingest(file_path):
    """Ingest documents from file path or directory"""
    all_chunks = []
    
    if os.path.isfile(file_path):
        # Single file
        chunks = ingest_file(file_path)
        all_chunks.extend(chunks)
    elif os.path.isdir(file_path):
        # Directory - process all supported files
        supported_extensions = ['*.pdf', '*.txt']
        for ext in supported_extensions:
            files = glob.glob(os.path.join(file_path, ext))
            for file in files:
                chunks = ingest_file(file)
                all_chunks.extend(chunks)
    else:
        print(f"❌ Error: {file_path} is not a valid file or directory")
        return
    
    if not all_chunks:
        print("❌ No documents were successfully processed")
        return
    
    print(f"\n🔍 Generating embeddings for {len(all_chunks)} chunks...")
    try:
        embeddings = get_embeddings()
        
        # Create or update vectorstore
        if os.path.exists(VECTORSTORE_PATH):
            print("📚 Loading existing vectorstore...")
            try:
                vectorstore = FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)
                vectorstore.add_documents(all_chunks)
                print("   ✅ Updated existing vectorstore")
            except Exception as e:
                print(f"   ⚠️ Could not load existing vectorstore: {str(e)}")
                print("   🔄 Creating new vectorstore...")
                vectorstore = FAISS.from_documents(all_chunks, embeddings)
        else:
            print("📚 Creating new vectorstore...")
            vectorstore = FAISS.from_documents(all_chunks, embeddings)
            print("   ✅ Created new vectorstore")
        
        # Save the vectorstore
        vectorstore.save_local(VECTORSTORE_PATH)
        print(f"💾 Vectorstore saved to {VECTORSTORE_PATH}")
        print(f"✅ Successfully processed {len(all_chunks)} document chunks")
        
    except Exception as e:
        print(f"❌ Error creating vectorstore: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest.py <path_to_file_or_directory>")
        print("Examples:")
        print("  python ingest.py data/contract.pdf")
        print("  python ingest.py data/")
        sys.exit(1)
    
    file_path = sys.argv[1]
    print(f"🚀 Starting document ingestion from: {file_path}")
    print("=" * 50)
    
    ingest(file_path)
    
    print("=" * 50)
    print("🎉 Ingestion complete!")
