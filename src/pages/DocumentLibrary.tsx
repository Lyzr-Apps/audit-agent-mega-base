import { useState } from 'react'
import { Link } from 'react-router-dom'
import { callAIAgent, uploadFiles } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  FileText,
  BarChart3,
  Activity,
  Folder,
  FolderOpen,
  Upload,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  File,
  Loader2,
  Send,
  X
} from 'lucide-react'

// Agent IDs
const DOCUMENT_QA_AGENT = '697085c51d92f5e2dd22900a'
const RAG_ID = '697085b457f90ab8a46e90c1'

// TypeScript interfaces from REAL test responses
interface Citation {
  source: string
  page?: number
  paragraph?: string
}

interface DocumentQAResult {
  answer: string
  citations: Citation[]
  confidence_score: number
  related_topics: string[]
}

// Sidebar component
function AppSidebar() {
  return (
    <div className="w-64 bg-[#1a1f36] text-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold font-mono">Due Diligence</h1>
        <p className="text-xs text-gray-400 mt-1">Intelligence Platform</p>
      </div>

      <nav className="flex-1 p-4">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 mb-2">
          <BarChart3 size={20} />
          <span>Analysis Dashboard</span>
        </Link>
        <Link to="/documents" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#c9a227] text-[#1a1f36] font-medium mb-2">
          <FileText size={20} />
          <span>Document Library</span>
        </Link>
        <Link to="/audit" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300">
          <Activity size={20} />
          <span>Audit Trail</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p className="font-mono">v1.0.0</p>
        <p className="mt-1">6 Active Agents</p>
      </div>
    </div>
  )
}

// Folder Tree Component
function FolderTreeItem({
  name,
  count,
  isOpen,
  onToggle
}: {
  name: string
  count: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg w-full text-left transition-colors">
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {isOpen ? <FolderOpen size={16} className="text-[#c9a227]" /> : <Folder size={16} className="text-gray-400" />}
        <span className="text-sm flex-1">{name}</span>
        <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
          {count}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-6 mt-1 space-y-1">
        {/* Placeholder for nested items - in real app would be dynamic */}
      </CollapsibleContent>
    </Collapsible>
  )
}

// Document Card Component
function DocumentCard({
  name,
  type,
  size,
  uploadDate
}: {
  name: string
  type: string
  size: string
  uploadDate: string
}) {
  return (
    <Card className="bg-white border-gray-200 hover:border-[#c9a227] transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <File size={20} className="text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{type}</Badge>
              <span className="text-xs text-gray-500">{size}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploaded {uploadDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Q&A Chat Message Component
function ChatMessage({
  type,
  content,
  citations,
  confidence
}: {
  type: 'user' | 'agent'
  content: string
  citations?: Citation[]
  confidence?: number
}) {
  return (
    <div className={`flex gap-3 ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${type === 'user' ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-lg p-4 ${
          type === 'user'
            ? 'bg-[#c9a227] text-[#1a1f36]'
            : 'bg-white border border-gray-200'
        }`}>
          <p className="text-sm leading-relaxed">{content}</p>

          {citations && citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-mono text-gray-500 mb-2">Citations ({citations.length}):</p>
              <div className="space-y-1">
                {citations.map((citation, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-[#c9a227]">•</span>
                    <span>{citation.source}{citation.page ? ` (p.${citation.page})` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {confidence !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">Confidence:</span>
              <Badge className={`text-xs ${
                confidence >= 80 ? 'bg-green-100 text-green-800' :
                confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {confidence}%
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DocumentLibrary() {
  const [uploading, setUploading] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'agent'
    content: string
    citations?: Citation[]
    confidence?: number
  }>>([])

  // Folder states
  const [folderStates, setFolderStates] = useState({
    cim: true,
    financials: false,
    contracts: false,
    memos: false,
    cashflow: false
  })

  const toggleFolder = (folder: keyof typeof folderStates) => {
    setFolderStates(prev => ({ ...prev, [folder]: !prev[folder] }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const result = await uploadFiles(Array.from(files))
      if (result.success) {
        console.log('Uploaded files:', result.asset_ids)
        // In real app: refresh document list
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const askQuestion = async () => {
    if (!question.trim() || loading) return

    const userQuestion = question
    setQuestion('')

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userQuestion }])
    setLoading(true)

    try {
      const result = await callAIAgent(userQuestion, DOCUMENT_QA_AGENT)

      if (result.success && result.response.status === 'success') {
        const qaData = result.response.result as DocumentQAResult
        setMessages(prev => [...prev, {
          type: 'agent',
          content: qaData.answer,
          citations: qaData.citations,
          confidence: qaData.confidence_score
        }])
      } else {
        // Handle error response
        const errorMsg = result.response.result?.answer || result.response.message || 'Unable to answer the question'
        setMessages(prev => [...prev, {
          type: 'agent',
          content: errorMsg,
          citations: [],
          confidence: 0
        }])
      }
    } catch (error) {
      console.error('Question failed:', error)
      setMessages(prev => [...prev, {
        type: 'agent',
        content: 'An error occurred while processing your question.',
        citations: [],
        confidence: 0
      }])
    } finally {
      setLoading(false)
    }
  }

  // Sample documents
  const sampleDocs = [
    { name: 'Confidential Information Memorandum.pdf', type: 'PDF', size: '12.4 MB', uploadDate: '2 days ago' },
    { name: 'Financial Statements Q3 2024.xlsx', type: 'XLSX', size: '856 KB', uploadDate: '2 days ago' },
    { name: 'Cash Flow Projections.xlsx', type: 'XLSX', size: '432 KB', uploadDate: '3 days ago' },
    { name: 'Supplier Contract - Acme Corp.pdf', type: 'PDF', size: '2.1 MB', uploadDate: '4 days ago' },
    { name: 'Management Memo - Q4 Strategy.docx', type: 'DOCX', size: '124 KB', uploadDate: '5 days ago' },
    { name: 'Balance Sheet Analysis.pdf', type: 'PDF', size: '1.8 MB', uploadDate: '1 week ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />

      <div className="flex-1 ml-64 flex">
        {/* Left Panel - Folder Tree (25%) */}
        <div className="w-1/4 border-r border-gray-200 bg-white p-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 font-mono mb-1">Document Library</h2>
            <p className="text-sm text-gray-600">127 documents</p>
          </div>

          <div className="space-y-1">
            <FolderTreeItem
              name="CIM Documents"
              count={24}
              isOpen={folderStates.cim}
              onToggle={() => toggleFolder('cim')}
            />
            <FolderTreeItem
              name="Financial Statements"
              count={42}
              isOpen={folderStates.financials}
              onToggle={() => toggleFolder('financials')}
            />
            <FolderTreeItem
              name="Contracts & Agreements"
              count={18}
              isOpen={folderStates.contracts}
              onToggle={() => toggleFolder('contracts')}
            />
            <FolderTreeItem
              name="Management Memos"
              count={31}
              isOpen={folderStates.memos}
              onToggle={() => toggleFolder('memos')}
            />
            <FolderTreeItem
              name="Cash Flow Models"
              count={12}
              isOpen={folderStates.cashflow}
              onToggle={() => toggleFolder('cashflow')}
            />
          </div>
        </div>

        {/* Right Panel - Documents & Preview (75%) */}
        <div className="flex-1 flex flex-col">
          {/* Top Section - Document Grid & Upload */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search documents..."
                    className="pl-10 font-mono"
                  />
                </div>
              </div>

              <label htmlFor="file-upload">
                <Button
                  disabled={uploading}
                  className="bg-[#c9a227] hover:bg-[#b89220] text-[#1a1f36] font-mono cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Upload Documents
                    </>
                  )}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.xlsx,.txt"
                />
              </label>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gray-50 hover:border-[#c9a227] transition-colors">
              <div className="text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1 font-mono">
                  Drag and drop files here, or click Upload Documents
                </p>
                <p className="text-xs text-gray-500">
                  Supported: PDF, DOCX, XLSX, TXT (Max 50MB per file)
                </p>
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-2 gap-4">
              {sampleDocs.map((doc, i) => (
                <DocumentCard key={i} {...doc} />
              ))}
            </div>
          </div>

          {/* Bottom Section - Chat Panel */}
          <div className={`border-t border-gray-200 bg-white transition-all ${chatOpen ? 'h-[400px]' : 'h-12'}`}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[#c9a227]" />
                <h3 className="font-mono text-sm font-semibold">Document Q&A Agent</h3>
                <Badge variant="outline" className="text-xs">
                  {messages.length} messages
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatOpen(!chatOpen)}
              >
                {chatOpen ? <X size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>

            {chatOpen && (
              <div className="flex flex-col h-[calc(100%-52px)]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 font-mono mb-2">Ask questions about your documents</p>
                      <p className="text-xs text-gray-400">
                        Example: What are the key liquidity risks in the financial statements?
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, i) => (
                        <ChatMessage key={i} {...msg} />
                      ))}
                      {loading && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="animate-spin" size={16} />
                          <span className="text-sm">Agent is analyzing...</span>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question about your documents..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                      className="flex-1 font-mono"
                      disabled={loading}
                    />
                    <Button
                      onClick={askQuestion}
                      disabled={!question.trim() || loading}
                      className="bg-[#c9a227] hover:bg-[#b89220] text-[#1a1f36]"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
