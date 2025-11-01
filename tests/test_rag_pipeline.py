import pytest
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.embeddings import get_embeddings
from modules.splitter import split_documents
from modules.loader import load_document

def test_embeddings():
    """Test that embeddings can be generated"""
    try:
        embeddings = get_embeddings()
        assert embeddings is not None
        print("✅ Embeddings test passed")
    except Exception as e:
        pytest.fail(f"Embeddings test failed: {str(e)}")

def test_splitter():
    """Test that text splitting works"""
    try:
        # Create a simple test document
        from langchain.schema import Document
        test_docs = [Document(page_content="This is a test document with some content that should be split into chunks." * 10)]
        
        chunks = split_documents(test_docs)
        assert len(chunks) > 0
        assert all(len(chunk.page_content) <= 1000 for chunk in chunks)
        print("✅ Splitter test passed")
    except Exception as e:
        pytest.fail(f"Splitter test failed: {str(e)}")

def test_loader():
    """Test that document loading works"""
    try:
        # Test with a simple text file
        test_content = "This is a test legal document."
        test_file = "test_doc.txt"
        
        with open(test_file, "w") as f:
            f.write(test_content)
        
        docs = load_document(test_file)
        assert len(docs) > 0
        assert "test legal document" in docs[0].page_content
        
        # Clean up
        os.remove(test_file)
        print("✅ Loader test passed")
    except Exception as e:
        pytest.fail(f"Loader test failed: {str(e)}")

if __name__ == "__main__":
    print("🧪 Running RAG pipeline tests...")
    test_embeddings()
    test_splitter()
    test_loader()
    print("🎉 All tests completed!")

