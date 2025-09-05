# ⚖️ LegalView - AI-Powered Legal Document Assistant

![LegalView Banner](https://img.shields.io/badge/LegalView-AI%20Powered%20Legal%20Assistant-blue?style=for-the-badge&logo=scale&logoColor=white)

A sophisticated RAG (Retrieval-Augmented Generation) application that helps you understand legal documents through AI-powered question answering. Built with modern technologies and featuring a stunning glassmorphism UI.

## 🖼️ Screenshots

### 📤 Upload Documents Interface
![Upload Documents](https://github.com/tharunK03/Legal-View/assets/upload-documents-screenshot.png)
*Clean, modern interface for uploading legal documents with drag-and-drop functionality*

### 💬 AI Chat Interface
![Ask Questions](https://github.com/tharunK03/Legal-View/assets/ask-questions-screenshot.png)
*Interactive chat interface with AI-powered document analysis and intelligent filtering*

### 📚 Document Library
![Document Library](https://github.com/tharunK03/Legal-View/assets/document-library-screenshot.png)
*Comprehensive document management with search, view, download, and delete capabilities*

## ✨ Features

### 🤖 **AI-Powered Analysis**
- **Intelligent Document Processing** - Upload PDF and text documents
- **Semantic Search** - Find relevant content by meaning, not just keywords
- **Context-Aware Answers** - AI responses based solely on your document content
- **Source Citations** - See exactly which parts of documents support each answer
- **Structured Formatting** - Professional legal document style responses

### 🎨 **Modern User Interface**
- **Glassmorphism Design** - Beautiful, modern aesthetic with backdrop blur effects
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - 60fps animations and transitions throughout
- **Interactive Elements** - Hover effects, loading states, and real-time feedback
- **Professional Branding** - Custom "Built by Tharun" footer with social links

### 📁 **Document Management**
- **Multi-Format Support** - PDF and text file processing
- **Batch Processing** - Handle multiple documents simultaneously
- **Search Functionality** - Quickly find documents in your library
- **CRUD Operations** - Upload, view, download, and delete documents
- **Metadata Display** - File size, upload date, and processing status

## 🎯 **Key Interface Features**

### **📤 Upload Documents Tab**
- **Drag & Drop Interface** - Intuitive file upload with visual feedback
- **File Type Validation** - Supports PDF, DOC, DOCX, and TXT files
- **Backend Connection Status** - Clear instructions for setup
- **Feature Overview Cards** - Smart Search, Term Definitions, Document Analysis

### **💬 Ask Questions Tab**
- **Query Type Selection** - General Question, Term Definition, Document Summary
- **Document Filtering** - Select specific documents for targeted queries
- **Real-time Chat Interface** - Interactive conversation with AI
- **Quick Actions** - Predefined action buttons for common tasks
- **System Status Indicators** - Backend connection and AI readiness status

### **📚 Document Library Tab**
- **Search & Filter** - Find documents quickly with search functionality
- **Document Cards** - Beautiful cards showing file details and metadata
- **Action Buttons** - View, download, and delete operations
- **Processing Status** - Visual indicators for document processing state
- **Refresh Functionality** - Update document list in real-time

## 🏗️ Architecture

### **System Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Gemini AI)   │
│   Port: 5173    │    │   Port: 8001    │    │   (Embeddings)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Modern UI     │    │   Document      │    │   Vector Store  │
│   Components    │    │   Processing    │    │   (FAISS)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow Architecture**
```
📄 Documents → 🔄 Processing → 🧠 AI Analysis → 💬 User Interface
     ↓              ↓              ↓              ↓
  Upload        Text Split      Embeddings    Chat Interface
     ↓              ↓              ↓              ↓
  Storage        Chunking       Vector DB     Real-time Q&A
     ↓              ↓              ↓              ↓
  File System    LangChain     FAISS Store   React Frontend
```

### **Technology Stack**

#### **Backend**
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM application framework
- **FAISS** - Facebook's vector similarity search
- **Google Gemini AI** - Advanced language model
- **Sentence Transformers** - Text embeddings
- **PyPDF2** - PDF text extraction

#### **Frontend**
- **React 18** - Modern UI framework
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API communication

## 🚀 Quick Start

### **Prerequisites**
- **Python 3.8+** - For backend services
- **Node.js 16+** - For frontend development
- **npm or yarn** - Package manager
- **Google Gemini API Key** - For AI functionality

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/tharunK03/Legal-View.git
cd Legal-View
```

### **Step 2: Set Up Python Backend**

#### **2.1 Create Virtual Environment**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

#### **2.2 Install Python Dependencies**
```bash
pip install -r requirements.txt
```

#### **2.3 Set Up Environment Variables**
```bash
# Create .env file in project root
echo "AI_API_KEY=your_gemini_api_key_here" > .env
```

**Get your Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Replace `your_gemini_api_key_here` with your actual key

### **Step 3: Set Up React Frontend**

#### **3.1 Navigate to Frontend Directory**
```bash
cd frontend
```

#### **3.2 Install Frontend Dependencies**
```bash
npm install
# or
yarn install
```

#### **3.3 Return to Project Root**
```bash
cd ..
```

### **Step 4: Prepare Documents (Optional)**

#### **4.1 Add Sample Documents**
```bash
# Create data directory if it doesn't exist
mkdir -p data

# Add your PDF or text files to the data/ directory
# Example:
# cp your_legal_document.pdf data/
```

#### **4.2 Ingest Documents**
```bash
# Process a single document
python ingest.py data/your_document.pdf

# Process all documents in data directory
python ingest.py data/
```

**Note:** You can also upload documents through the web interface after starting the application.

## 🏃‍♂️ Running the Application

### **Method 1: Development Mode (Recommended)**

#### **Terminal 1: Start Backend Server**
```bash
# Make sure you're in the project root directory
cd /path/to/Legal-View

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start FastAPI backend
python backend/main.py
```

**Expected Output:**
```
✅ RAG chain initialized successfully
🚀 Starting LegalView Backend...
📁 Data directory: /path/to/Legal-View/data
🔍 Vectorstore path: vectorstore
🌐 Server will run on: http://localhost:8001
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

#### **Terminal 2: Start Frontend Server**
```bash
# Navigate to frontend directory
cd frontend

# Start React development server
npm run dev
# or
yarn dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### **Method 2: Using Streamlit (Legacy)**

If you prefer the original Streamlit interface:

```bash
# Activate virtual environment
source venv/bin/activate

# Start Streamlit app
streamlit run app.py
```

## 🌐 Access the Application

### **Web Interface**
- **Main Application:** http://localhost:5173
- **API Documentation:** http://localhost:8001/docs
- **API Health Check:** http://localhost:8001/health

## 🎬 **Live Demo**

Once you have the application running, you can experience:

### **1. Document Upload Flow**
1. Navigate to the **Upload Documents** tab
2. Drag and drop your legal documents (PDF, DOC, DOCX, TXT)
3. Watch the AI process and analyze your documents
4. Get confirmation of successful processing

### **2. AI-Powered Question Answering**
1. Switch to the **Ask Questions** tab
2. Select your document from the dropdown (optional)
3. Choose query type: General Question, Term Definition, or Document Summary
4. Ask questions like:
   - "What are the key terms in this contract?"
   - "Define force majeure"
   - "Summarize the main obligations"
5. Get AI-powered answers with source citations

### **3. Document Management**
1. Visit the **Document Library** tab
2. Search through your uploaded documents
3. View document metadata (size, type, upload date)
4. Download original files or delete documents
5. Use the refresh button to update the list

### **Application Features**

#### **1. Upload Documents**
- Navigate to "Upload Documents" tab
- Drag and drop or select PDF/text files
- Wait for processing confirmation

#### **2. Ask Questions**
- Go to "Ask Questions" tab
- Type your legal questions
- Get AI-powered answers with source citations
- Use document filtering for specific documents

#### **3. Manage Documents**
- Visit "Document Library" tab
- View, download, or delete documents
- Search through your document collection

## 🔧 Configuration

### **Environment Variables**
```bash
# .env file
AI_API_KEY=your_gemini_api_key_here
```

### **Key Settings** (`config.py`)
```python
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "gemini-1.5-flash"
VECTORSTORE_PATH = "vectorstore"
```

### **Frontend Configuration** (`frontend/vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8001'
    }
  }
})
```

## 📁 Project Structure

```
Legal-View/
├── 🎨 frontend/               # React Frontend (Port 5173)
│   ├── src/
│   │   ├── components/        # 🧩 UI Components
│   │   │   ├── 📤 DocumentUpload.tsx
│   │   │   ├── 💬 ChatInterface.tsx
│   │   │   └── 📚 DocumentList.tsx
│   │   ├── 🏠 App.tsx         # Main Application
│   │   └── 🚀 main.tsx        # Entry Point
│   ├── 📦 package.json        # Frontend Dependencies
│   └── ⚙️ vite.config.ts      # Build Configuration
├── 🔧 backend/                # FastAPI Backend (Port 8001)
│   ├── 🚀 main.py             # Main API Server
│   └── 🔄 simple_main.py      # Simplified Backend
├── 🧠 modules/                # Core AI Functionality
│   ├── 🔤 embeddings.py       # Text Embedding Generation
│   ├── 📄 loader.py           # Document Loading
│   ├── 🔗 rag_chain.py        # RAG Pipeline
│   ├── 🔍 retriever.py        # Document Retrieval
│   └── ✂️ splitter.py         # Text Splitting
├── 📁 data/                   # Document Storage
├── 🗄️ vectorstore/            # FAISS Vector Database
├── 🧪 tests/                  # Test Files
├── ⚙️ config.py               # Configuration Settings
├── 📥 ingest.py               # Document Ingestion Script
├── 📱 app.py                  # Streamlit App (Legacy)
├── 📋 requirements.txt        # Python Dependencies
└── 🔐 .env                    # Environment Variables
```

### **Key Directories Explained**

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| 🎨 **frontend/** | React UI with modern glassmorphism design | App.tsx, components/ |
| 🔧 **backend/** | FastAPI server with document processing | main.py |
| 🧠 **modules/** | Core AI and document processing logic | rag_chain.py, embeddings.py |
| 📁 **data/** | Storage for uploaded legal documents | *.pdf, *.txt files |
| 🗄️ **vectorstore/** | FAISS database for semantic search | index.faiss, index.pkl |
| 🧪 **tests/** | Unit and integration tests | test_rag_pipeline.py |

## 🧪 Testing

### **Run Backend Tests**
```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_rag_pipeline.py
```

### **Test API Endpoints**
```bash
# Health check
curl http://localhost:8001/health

# List documents
curl http://localhost:8001/documents

# Test query
curl -X POST http://localhost:8001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is this document about?"}'
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Backend Won't Start**
```bash
# Check if port 8001 is available
lsof -i :8001

# Kill process using the port
kill -9 <PID>

# Restart backend
python backend/main.py
```

#### **Frontend Won't Start**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start again
npm run dev
```

#### **Documents Don't Load**
```bash
# Re-ingest documents
python ingest.py data/

# Restart backend
python backend/main.py
```

#### **API Connection Issues**
```bash
# Check if backend is running
curl http://localhost:8001/health

# Check CORS settings in backend/main.py
# Ensure frontend URL is in allowed origins
```

#### **Environment Variable Issues**
```bash
# Check if .env file exists
ls -la .env

# Verify API key format
cat .env
```

### **Performance Optimization**

#### **For Large Documents**
```python
# In modules/splitter.py, adjust chunk size
chunk_size=500  # Smaller chunks for better performance
chunk_overlap=100
```

#### **For Better AI Responses**
```python
# In modules/rag_chain.py, adjust temperature
temperature=0.1  # Lower for more consistent answers
max_output_tokens=1000  # Adjust based on needs
```

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for sensitive information
- **The application only processes** documents you explicitly upload
- **Documents are stored locally** on your server
- **API endpoints are protected** with proper CORS settings

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tharun K**
- GitHub: [@tharunK03](https://github.com/tharunK03)
- LinkedIn: [tharun-k03](https://www.linkedin.com/in/tharun-k03/)

## 🙏 Acknowledgments

- [LangChain](https://github.com/langchain-ai/langchain) for the amazing LLM framework
- [Google Gemini](https://ai.google.dev/) for the powerful language model
- [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI
- [FastAPI](https://fastapi.tiangolo.com/) for the robust backend framework

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/tharunK03/Legal-View?style=social)
![GitHub forks](https://img.shields.io/github/forks/tharunK03/Legal-View?style=social)
![GitHub issues](https://img.shields.io/github/issues/tharunK03/Legal-View)
![GitHub license](https://img.shields.io/github/license/tharunK03/Legal-View)

---

⭐ **Star this repository if you found it helpful!**