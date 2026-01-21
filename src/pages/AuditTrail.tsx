import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText,
  BarChart3,
  Activity,
  Download,
  Filter,
  Search,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  FileSpreadsheet,
  Presentation
} from 'lucide-react'

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
        <Link to="/documents" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 mb-2">
          <FileText size={20} />
          <span>Document Library</span>
        </Link>
        <Link to="/audit" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#c9a227] text-[#1a1f36] font-medium">
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

// Timeline Item Component
function TimelineItem({
  timestamp,
  agent,
  action,
  status,
  findings,
  citations,
  confidence
}: {
  timestamp: string
  agent: string
  action: string
  status: 'success' | 'warning' | 'error'
  findings?: string[]
  citations?: string[]
  confidence?: number
}) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    error: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200'
    }
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200 last:hidden" />

      {/* Timeline dot */}
      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center`}>
        <StatusIcon size={14} className={config.color} />
      </div>

      {/* Content */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs">{agent}</Badge>
                <Badge className={`text-xs ${
                  status === 'success' ? 'bg-green-100 text-green-800' :
                  status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium text-gray-900">{action}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>{timestamp}</span>
            </div>
          </div>
        </CardHeader>

        {(findings || citations || confidence !== undefined) && (
          <CardContent>
            {findings && findings.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-mono text-gray-500 mb-2">Key Findings:</p>
                <ul className="space-y-1">
                  {findings.map((finding, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-[#c9a227] mt-1">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {citations && citations.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-mono text-gray-500 mb-2">Source Citations ({citations.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {citations.map((citation, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {citation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {confidence !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500">Confidence Score:</span>
                <Badge className={`text-xs ${
                  confidence >= 80 ? 'bg-green-100 text-green-800' :
                  confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {confidence}%
                </Badge>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

// Finding Card Component
function FindingCard({
  category,
  severity,
  finding,
  agent,
  citations,
  confidence
}: {
  category: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  finding: string
  agent: string
  citations: string[]
  confidence: number
}) {
  const severityColors = {
    HIGH: 'bg-red-100 text-red-800 border-red-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <Card className="bg-white border-gray-200 hover:border-[#c9a227] transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">{category}</Badge>
            <Badge className={`text-xs border ${severityColors[severity]}`}>
              {severity}
            </Badge>
          </div>
          <Badge className={`text-xs ${
            confidence >= 80 ? 'bg-green-100 text-green-800' :
            confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{finding}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <User size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{agent}</span>
          </div>
          <div className="flex gap-1">
            {citations.map((citation, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {citation}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AuditTrail() {
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample audit trail data
  const auditItems = [
    {
      timestamp: '2 hours ago',
      agent: 'Diligence Coordinator Agent',
      action: 'Comprehensive Analysis Completed',
      status: 'success' as const,
      findings: [
        'Overall risk score: 62/100',
        'Recommendation: PROCEED_WITH_CAUTION',
        'Identified 4 high-priority findings'
      ],
      confidence: 85
    },
    {
      timestamp: '2 hours ago',
      agent: 'External Auditor Lens Agent',
      action: 'Audit Compliance Review',
      status: 'warning' as const,
      findings: [
        'Related-party transactions inadequately disclosed',
        'Documentation gaps for unusual expenses',
        'Further diligence required'
      ],
      citations: ['CIM.pdf p.42', 'FinStmt_Q3.xlsx'],
      confidence: 78
    },
    {
      timestamp: '3 hours ago',
      agent: 'Sustainability Analysis Agent',
      action: 'Earnings Quality Assessment',
      status: 'warning' as const,
      findings: [
        'Multiple one-time items identified',
        'Normalized earnings lower than reported',
        'Revenue growth assumptions need validation'
      ],
      citations: ['CashFlow_Proj.xlsx', 'FinStmt_Q3.xlsx'],
      confidence: 82
    },
    {
      timestamp: '3 hours ago',
      agent: 'Operational Efficiency Agent',
      action: 'Margin & Cost Structure Analysis',
      status: 'warning' as const,
      findings: [
        'EBITDA margin volatility detected',
        'Inconsistent expense controls',
        'Cost structure sustainability concerns'
      ],
      citations: ['FinStmt_Q3.xlsx', 'BalanceSheet.pdf'],
      confidence: 76
    },
    {
      timestamp: '4 hours ago',
      agent: 'Liquidity Risk Agent',
      action: 'Cash Flow & Covenant Analysis',
      status: 'warning' as const,
      findings: [
        'Cash flow coverage concerns',
        'Delayed receivables impacting working capital',
        'Covenant compliance at risk'
      ],
      citations: ['CashFlow_Proj.xlsx', 'DebtAgreement.pdf'],
      confidence: 88
    },
    {
      timestamp: '1 day ago',
      agent: 'Document Q&A Agent',
      action: 'User Query: What are the key liquidity risks?',
      status: 'success' as const,
      findings: [
        'Answered with 3 specific liquidity concerns',
        'Provided citations from financial statements',
        'Suggested areas for follow-up'
      ],
      citations: ['FinStmt_Q3.xlsx', 'CIM.pdf'],
      confidence: 72
    }
  ]

  // Sample findings
  const findings = [
    {
      category: 'Liquidity',
      severity: 'HIGH' as const,
      finding: 'Cash flow projections do not adequately cover upcoming debt obligations, and there are signs of delayed receivables negatively impacting working capital.',
      agent: 'Liquidity Risk Agent',
      citations: ['CashFlow_Proj.xlsx', 'DebtAgreement.pdf'],
      confidence: 88
    },
    {
      category: 'Audit',
      severity: 'HIGH' as const,
      finding: 'Critical related-party transactions are not adequately disclosed, and there are documentation gaps regarding several large, unusual expense items.',
      agent: 'External Auditor Lens Agent',
      citations: ['CIM.pdf p.42', 'FinStmt_Q3.xlsx'],
      confidence: 78
    },
    {
      category: 'Operations',
      severity: 'MEDIUM' as const,
      finding: 'EBITDA margins have shown volatility over the past eight quarters, with expense controls showing inconsistent effectiveness.',
      agent: 'Operational Efficiency Agent',
      citations: ['FinStmt_Q3.xlsx'],
      confidence: 76
    },
    {
      category: 'Sustainability',
      severity: 'MEDIUM' as const,
      finding: 'Earnings have been positively impacted by multiple one-time items and significant adjustments; normalized earnings are lower than reported figures.',
      agent: 'Sustainability Analysis Agent',
      citations: ['CashFlow_Proj.xlsx', 'FinStmt_Q3.xlsx'],
      confidence: 82
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />

      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-mono">Audit Trail</h1>
          <p className="text-gray-600 mt-1">Complete analysis history with citations and confidence scores</p>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono"
              />
            </div>

            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="w-48 font-mono">
                <SelectValue placeholder="Filter by Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="coordinator">Diligence Coordinator</SelectItem>
                <SelectItem value="liquidity">Liquidity Risk</SelectItem>
                <SelectItem value="operational">Operational Efficiency</SelectItem>
                <SelectItem value="sustainability">Sustainability</SelectItem>
                <SelectItem value="auditor">External Auditor</SelectItem>
                <SelectItem value="qa">Document Q&A</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-48 font-mono">
                <SelectValue placeholder="Filter by Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="font-mono">
              <Filter className="mr-2" size={16} />
              More Filters
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="font-mono">
              <FileSpreadsheet className="mr-2" size={16} />
              Export Excel
            </Button>
            <Button variant="outline" className="font-mono">
              <Presentation className="mr-2" size={16} />
              Export Slides
            </Button>
            <Button className="bg-[#c9a227] hover:bg-[#b89220] text-[#1a1f36] font-mono">
              <Download className="mr-2" size={16} />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Timeline View (2 columns) */}
          <div className="col-span-2">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <Activity size={20} className="text-[#c9a227]" />
                  Analysis Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[800px] pr-4">
                  {auditItems.map((item, i) => (
                    <TimelineItem key={i} {...item} />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Findings Panel (1 column) */}
          <div>
            <Card className="bg-white border-gray-200 mb-6">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <AlertTriangle size={20} className="text-[#c9a227]" />
                  All Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">2</p>
                    <p className="text-xs text-gray-500 font-mono">High</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">2</p>
                    <p className="text-xs text-gray-500 font-mono">Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-xs text-gray-500 font-mono">Low</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ScrollArea className="h-[700px]">
              <div className="space-y-4">
                {findings.map((finding, i) => (
                  <FindingCard key={i} {...finding} />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
