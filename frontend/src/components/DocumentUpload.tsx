import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle, Search } from 'lucide-react'
import axios from 'axios'

interface DocumentUploadProps {
  onDocumentUploaded: (filename: string) => void
}

interface UploadedFile {
  file: File
  status: 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

const DocumentUpload = ({ onDocumentUploaded }: DocumentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      status: 'uploading',
      progress: 0
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    handleUpload(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  })

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          )
        }, 200)

        // Upload to backend API
        const response = await axios.post('http://localhost:8001/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        
        clearInterval(progressInterval)
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        )
        
        onDocumentUploaded(file.name)
        
        // Show success message
        console.log('Upload successful:', response.data)
        
      } catch (error) {
        console.error('Upload error:', error)
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, status: 'error', error: 'Upload failed - check if backend is running' }
              : f
          )
        )
      }
    }
  }

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 px-4 py-2 rounded-full mb-4 transition-colors duration-500">
          <Upload className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-200">Document Upload</span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-3 transition-colors duration-500">
          Upload Legal Documents
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto transition-colors duration-500">
          Upload your legal documents to get started. Our AI will analyze them and help you understand 
          legal terms, answer questions, and provide insights based on your specific documents.
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 scale-105'
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-800/60 dark:hover:to-blue-500/10 hover:scale-102'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Upload className="h-10 w-10 text-blue-600 dark:text-blue-300" />
        </div>
        <div className="space-y-3">
          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors duration-500">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-slate-600 dark:text-slate-300">or click to browse files</p>
          <p className="text-sm text-slate-500 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 px-3 py-1 rounded-full inline-block transition-colors duration-500">
            Supports PDF, DOC, DOCX, and TXT files
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2 transition-colors duration-500">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            <span>Uploaded Files</span>
          </h3>
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-6 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-500"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{uploadedFile.file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {uploadedFile.status === 'uploading' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{uploadedFile.progress}%</span>
                  </div>
                )}
                
                {uploadedFile.status === 'success' && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">Uploaded</span>
                  </div>
                )}
                
                {uploadedFile.status === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">{uploadedFile.error}</span>
                  </div>
                )}
                
                <button
                  onClick={() => removeFile(uploadedFile.file)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backend Status */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Backend Connection Required</h3>
        <p className="text-sm text-blue-700 mb-3">
          To upload and process documents, make sure your FastAPI backend is running on <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:8000</code>
        </p>
        <div className="text-xs text-blue-600">
          <p>• Backend processes documents and creates embeddings</p>
          <p>• Documents are stored in the vector database</p>
          <p>• AI can then answer questions based on your documents</p>
          <p>• Run <code className="bg-blue-100 px-1 py-0.5 rounded">python backend/main.py</code> to start the backend</p>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 bg-white rounded-xl border border-legal-200">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-legal-900 mb-2">Smart Search</h3>
          <p className="text-legal-600 text-sm">
            Ask questions about your documents and get AI-powered answers
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl border border-legal-200">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-legal-900 mb-2">Term Definitions</h3>
          <p className="text-legal-600 text-sm">
            Get clear explanations of legal terms found in your documents
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl border border-legal-200">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-legal-900 mb-2">Document Analysis</h3>
          <p className="text-legal-600 text-sm">
            Comprehensive analysis and summaries of your legal documents
          </p>
        </div>
      </div>
    </div>
  )
}

export default DocumentUpload
