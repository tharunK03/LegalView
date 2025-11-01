import { useState, useEffect } from 'react'
import { Send, Search, FileText, BookOpen, MessageSquare, FileIcon } from 'lucide-react'
import axios from 'axios'

interface ChatInterfaceProps {
  documents: string[]
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

interface Document {
  name: string
  display_name: string
  size: number
  type: string
  uploaded: number
  path: string
}

const ChatInterface = ({ documents }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI legal assistant. I can help you understand legal terms, answer questions about your documents, and provide insights. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [queryType, setQueryType] = useState<'general' | 'term' | 'summary'>('general')
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<string>('')

  // Fetch available documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://localhost:8001/documents')
        setAvailableDocuments(response.data.documents)
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }
    fetchDocuments()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Connect to your actual backend API
      const response = await axios.post('http://localhost:8001/query', {
        query: inputValue,
        document_filter: selectedDocument || undefined
      })
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.data.answer,
        timestamp: new Date(),
        sources: response.data.sources?.map((source: any) => 
          `${source.metadata?.source || 'Document'} - Page ${source.metadata?.page || 'Unknown'}`
        ) || []
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error querying backend:', error)
      
      // Fallback to mock response if backend is not available
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm having trouble connecting to the document database right now. Please make sure your backend is running and try again. For now, here's what I would typically say about "${inputValue}": [This would contain an actual summary based on your document content when the backend is connected]`,
        timestamp: new Date(),
        sources: []
      }
      
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getQueryTypeLabel = (type: string) => {
    switch (type) {
      case 'general': return 'General Question'
      case 'term': return 'Term Definition'
      case 'summary': return 'Document Summary'
      default: return 'General Question'
    }
  }

  const formatLegalContent = (content: string) => {
    // Check if content contains structured legal information
    if (content.includes('* **') && (content.includes('**:') || content.includes('** '))) {
      return (
        <div className="space-y-4 text-slate-700 dark:text-slate-200">
          {content.split('\n').map((line, index) => {
            const trimmedLine = line.trim()
            
            if (trimmedLine.startsWith('* **') && trimmedLine.includes('**:')) {
              // Format main legal terms/definitions
              const parts = trimmedLine.split('**:')
              const term = parts[0].replace('* **', '').trim()
              const definition = parts[1]?.trim()
              
              return (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    {term}
                  </h4>
                  <p className="text-blue-800 dark:text-blue-100/80 leading-relaxed ml-5">{definition}</p>
                </div>
              )
            } else if (trimmedLine.startsWith('* **') && trimmedLine.includes('** ')) {
              // Format sub-items with different styling
              const parts = trimmedLine.split('** ')
              const term = parts[0].replace('* **', '').trim()
              const definition = parts[1]?.trim()
              
              return (
                <div key={index} className="ml-6 border-l-2 border-slate-300 dark:border-slate-600 pl-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-r-lg">
                  <h5 className="font-medium text-slate-800 dark:text-slate-100 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-2"></span>
                    {term}
                  </h5>
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed ml-3.5">{definition}</p>
                </div>
              )
            } else if (trimmedLine.startsWith('* ')) {
              // Format bullet points
              const text = trimmedLine.replace('* ', '').trim()
              return (
                <div key={index} className="flex items-start space-x-3 ml-6">
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full mt-2 flex-shrink-0"></span>
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{text}</p>
                </div>
              )
            } else if (trimmedLine) {
              // Regular paragraphs
              return (
                <p key={index} className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {trimmedLine}
                </p>
              )
            }
            return null
          })}
        </div>
      )
    }
    
    // For non-structured content, return as regular text with better formatting
    return (
      <div className="space-y-2 text-slate-700 dark:text-slate-200">
        {content.split('\n').map((line, index) => {
          if (line.trim()) {
            return (
              <p key={index} className="leading-relaxed">
                {line.trim()}
              </p>
            )
          }
          return null
        })}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto transition-colors duration-500">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 px-4 py-2 rounded-full mb-4 transition-colors duration-500">
          <Search className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-200">AI Assistant</span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-3 transition-colors duration-500">
          Ask Questions About Your Documents
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto transition-colors duration-500">
          Get AI-powered answers based on your uploaded legal documents with intelligent document filtering
        </p>
      </div>

      {/* Query Type Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 transition-colors duration-500">
          Query Type
        </label>
        <div className="flex flex-wrap gap-3">
          {(['general', 'term', 'summary'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setQueryType(type)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                queryType === type
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105 dark:from-blue-500 dark:to-indigo-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600'
              }`}
            >
              {getQueryTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Document Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 transition-colors duration-500">
          Select Document (Optional)
        </label>
        <div className="flex items-center space-x-3">
          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-colors duration-500"
          >
            <option value="">All Documents</option>
            {availableDocuments.map((doc) => (
              <option key={doc.name} value={doc.name}>
                {doc.display_name} ({doc.type})
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const fetchDocuments = async () => {
                try {
                  const response = await axios.get('http://localhost:8001/documents')
                  setAvailableDocuments(response.data.documents)
                } catch (error) {
                  console.error('Error fetching documents:', error)
                }
              }
              fetchDocuments()
            }}
            className="px-4 py-3 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Refresh document list"
          >
            <FileIcon className="h-4 w-4" />
          </button>
        </div>
        {selectedDocument && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/40 rounded-xl transition-colors duration-500">
            <p className="text-sm text-blue-700 dark:text-blue-200 flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Queries will be filtered to: <span className="font-semibold">{selectedDocument}</span></span>
            </p>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/60 p-6 mb-8 h-96 overflow-y-auto shadow-lg transition-colors duration-500">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-lg px-6 py-4 rounded-2xl shadow-sm transition-colors duration-500 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-500 dark:to-indigo-500'
                    : 'bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 border border-slate-200 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900/80 dark:text-slate-100 dark:border-slate-700/60'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {formatLegalContent(message.content)}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-300 mb-2">Sources:</p>
                    {message.sources.map((source, index) => (
                      <p key={index} className="text-xs text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 px-2 py-1 rounded mb-1 transition-colors duration-500">{source}</p>
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-3 text-white/80 dark:text-slate-300">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-500">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm font-medium">Searching through your documents...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask a ${queryType === 'term' ? 'legal term to define' : queryType === 'summary' ? 'topic to summarize' : 'question about your documents'}...`}
            className="w-full px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm text-slate-900 dark:text-slate-100 transition-colors duration-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            rows={3}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-400 dark:hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Send className="h-5 w-5" />
          <span className="font-medium">Send</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center transition-colors duration-500">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => {
              setQueryType('term')
              setInputValue('force majeure')
            }}
            className="p-6 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Define Legal Terms</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Get explanations of legal terminology</p>
          </button>
          
          <button
            onClick={() => {
              setQueryType('summary')
              setInputValue('terms and conditions')
            }}
            className="p-6 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Document Summary</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Get summaries of specific topics</p>
          </button>
          
          <button
            onClick={() => {
              setQueryType('general')
              setInputValue('What are the main clauses in this contract?')
            }}
            className="p-6 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Ask Questions</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Get answers to specific questions</p>
          </button>
        </div>
      </div>

      {/* Document Status */}
      {documents.length > 0 && (
        <div className="mt-12 p-6 bg-slate-50/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors duration-500">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            <span>Available Documents</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {documents.map((doc, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm transition-colors duration-500"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Backend Status */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/15 dark:to-indigo-500/15 rounded-2xl border border-blue-200 dark:border-blue-500/30 transition-colors duration-500">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>System Status</span>
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-100">
          ✅ Backend connected and running on <code className="bg-blue-100 dark:bg-blue-500/20 px-2 py-1 rounded-lg font-mono">http://localhost:8001</code>
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-200 mt-2">
          🚀 AI-powered document analysis ready
        </p>
      </div>
    </div>
  )
}

export default ChatInterface
