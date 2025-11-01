from typing import Optional

from langchain_community.vectorstores import FAISS

from modules.embeddings import get_embeddings
from config import VECTORSTORE_PATH


def get_vectorstore():
    embeddings = get_embeddings()
    return FAISS.load_local(
        VECTORSTORE_PATH,
        embeddings,
        allow_dangerous_deserialization=True,
    )


def get_retriever(document_source: Optional[str] = None):
    """
    Build a retriever, optionally scoped to a specific document.
    """
    vectorstore = get_vectorstore()
    search_kwargs = {"k": 3}
    if document_source:
        # Filter by the full metadata source path stored in the vector store
        search_kwargs["filter"] = {"source": document_source}
    return vectorstore.as_retriever(search_kwargs=search_kwargs)
