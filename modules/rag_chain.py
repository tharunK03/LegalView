from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from typing import Optional

from modules.retriever import get_retriever
from config import LLM_MODEL, AI_API_KEY


def get_rag_chain(document_source: Optional[str] = None):
    retriever = get_retriever(document_source=document_source)
    llm = ChatGoogleGenerativeAI(
        model=LLM_MODEL,
        google_api_key=AI_API_KEY,
        temperature=0.1,  # Lower temperature for more consistent answers
        max_output_tokens=1000
    )
    
    # Enhanced prompt template for better legal document understanding
    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template="""You are a helpful legal document assistant. Your task is to answer questions based on the provided legal documents.

When answering:
1. Base your response ONLY on the information found in the source documents
2. If asked to define a term, provide a clear, accurate definition based on how it's used in the documents
3. If the term isn't found in the documents, say so clearly
4. Always cite specific parts of the documents when possible
5. Use clear, professional language suitable for legal contexts
6. If you're unsure about something, acknowledge the limitations

For structured information (like definitions, clauses, responsibilities), format your response using:
* **Term/Concept:** Definition or explanation
* **Sub-item:** Additional details
* **Clause X:** Specific clause information

Context: {context}

Question: {question}

Answer based on the documents:"""
    )

    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={
            "prompt": prompt_template
        }
    )
