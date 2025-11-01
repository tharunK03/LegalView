import streamlit as st
from modules.rag_chain import get_rag_chain
import os

# Page configuration
st.set_page_config(
    page_title="⚖️ Legal Document Assistant",
    page_icon="⚖️",
    layout="wide"
)

# Title and description
st.title("⚖️ Legal Document Assistant")
st.markdown("""
This assistant helps you understand legal terms and answer questions based on your uploaded legal documents.
Ask about specific terms, concepts, or any legal questions, and get answers grounded in your document content.
""")

# Check if vectorstore exists
if not os.path.exists("vectorstore"):
    st.error("⚠️ No documents have been ingested yet. Please run `python ingest.py <document_path>` first.")
    st.stop()

# Initialize RAG chain
try:
    qa_chain = get_rag_chain()
    st.success("✅ Document knowledge base loaded successfully!")
except Exception as e:
    st.error(f"❌ Error loading document knowledge base: {str(e)}")
    st.stop()

# Sidebar for different query types
st.sidebar.header("🔍 Query Options")
query_type = st.sidebar.selectbox(
    "Choose your query type:",
    ["General Question", "Term Definition", "Document Summary"]
)

# Main query input
if query_type == "General Question":
    st.subheader("❓ Ask a General Legal Question")
    query = st.text_input(
        "What would you like to know about your legal documents?",
        placeholder="e.g., What are the key obligations in this contract?"
    )
elif query_type == "Term Definition":
    st.subheader("📖 Define a Legal Term")
    query = st.text_input(
        "Enter a legal term to define:",
        placeholder="e.g., force majeure, consideration, tort"
    )
    if query:
        query = f"Define and explain the legal term '{query}' based on the document content"
else:  # Document Summary
    st.subheader("📋 Document Summary")
    query = st.text_input(
        "What aspect would you like summarized?",
        placeholder="e.g., main clauses, key parties, important dates"
    )
    if query:
        query = f"Provide a summary of {query} from the document"

# Process query when submitted
if query:
    st.markdown("---")
    
    with st.spinner("🔍 Searching through your documents..."):
        try:
            result = qa_chain.invoke({"query": query})
            
            # Display answer
            st.markdown("### 📝 Answer:")
            st.write(result["result"])
            
            # Display source documents
            if result.get("source_documents"):
                st.markdown("### 📚 Source Documents:")
                for i, doc in enumerate(result["source_documents"], 1):
                    with st.expander(f"📄 Source {i} (Page {getattr(doc, 'metadata', {}).get('page', 'Unknown')})"):
                        st.write(doc.page_content)
                        if hasattr(doc, 'metadata') and doc.metadata:
                            st.caption(f"**Metadata:** {doc.metadata}")
            else:
                st.info("No specific source documents found for this query.")
                
        except Exception as e:
            st.error(f"❌ Error processing your query: {str(e)}")

# Footer with usage instructions
st.markdown("---")
st.markdown("""
**💡 Tips for better results:**
- Be specific in your questions
- Use legal terminology when possible
- Ask for definitions of terms you don't understand
- Request summaries of specific sections or topics
""")

# Check if documents exist
if os.path.exists("data"):
    data_files = [f for f in os.listdir("data") if f.endswith(('.pdf', '.txt'))]
    if data_files:
        st.sidebar.markdown("---")
        st.sidebar.markdown("### 📁 Available Documents:")
        for file in data_files:
            st.sidebar.text(f"• {file}")
