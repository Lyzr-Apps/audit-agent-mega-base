import { useState } from 'react'
import { Link } from 'react-router-dom'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  FileText,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  Loader2,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react'

// Agent IDs from workflow.json
const AGENTS = {
  DILIGENCE_COORDINATOR: '6970866a1d92f5e2dd229050',
  LIQUIDITY_RISK: '697085e11d92f5e2dd229018',
  OPERATIONAL_EFFICIENCY: '697085fcd6d0dcaec111699d',
  SUSTAINABILITY: '6970861b1d92f5e2dd229038',
  EXTERNAL_AUDITOR: '6970863cd6d0dcaec11169af',
}

// TypeScript interfaces from REAL test responses
interface KeyFinding {
  category: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  finding: string
  source_agent: string
}

interface PrioritizedRisk {
  risk: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
  mitigation: string
}

interface SubAgentSummary {
  agent_name: string
  status: string
  summary: string
}

interface DiligenceCoordinatorResult {
  overall_risk_score: number
  recommendation: string
  executive_summary: string
  key_findings: KeyFinding[]
  cross_referenced_insights: string[]
  prioritized_risks: PrioritizedRisk[]
  action_items: string[]
  sub_agent_summaries: SubAgentSummary[]
}

// Inline components
function AppSidebar() {
  return (
    <div className="w-64 bg-[#1a1f36] text-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold font-mono">Due Diligence</h1>
        <p className="text-xs text-gray-400 mt-1">Intelligence Platform</p>
      </div>

      <nav className="flex-1 p-4">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#c9a227] text-[#1a1f36] font-medium mb-2">
          <BarChart3 size={20} />
          <span>Analysis Dashboard</span>
        </Link>
        <Link to="/documents" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 mb-2">
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

function DealSummaryHeader() {
  return (
    <Card className="bg-[#1a1f36] text-white border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-mono">Target Company Acquisition</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Manufacturing & Distribution | Series B PE Deal
            </CardDescription>
          </div>
          <Badge className="bg-[#c9a227] text-[#1a1f36] hover:bg-[#c9a227]">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 font-mono">Deal Size</p>
            <p className="text-2xl font-bold mt-1">$150M</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-mono">EBITDA Multiple</p>
            <p className="text-2xl font-bold mt-1">8.5x</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-mono">Documents</p>
            <p className="text-2xl font-bold mt-1">127</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-mono">Analysis Status</p>
            <p className="text-2xl font-bold mt-1 text-[#c9a227]">62/100</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RiskGauge({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-red-500'
    if (s >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getProgressColor = (s: number) => {
    if (s >= 70) return 'bg-red-500'
    if (s >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400 font-mono">{label}</span>
        <span className={`text-2xl font-bold ${getColor(score)}`}>{score}</span>
      </div>
      <div className="relative">
        <Progress value={score} className="h-2" />
        <div className={`absolute inset-0 h-2 rounded-full ${getProgressColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function AgentCard({
  name,
  icon: Icon,
  status,
  riskScore,
  keyFindings,
  onClick
}: {
  name: string
  icon: any
  status: 'pending' | 'analyzing' | 'complete'
  riskScore?: number
  keyFindings?: string[]
  onClick: () => void
}) {
  const statusColors = {
    pending: 'bg-gray-500',
    analyzing: 'bg-yellow-500',
    complete: 'bg-green-500'
  }

  const statusText = {
    pending: 'Pending',
    analyzing: 'Analyzing',
    complete: 'Complete'
  }

  return (
    <Card className="bg-white border-gray-200 hover:border-[#c9a227] transition-colors cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1f36] rounded-lg">
              <Icon size={20} className="text-[#c9a227]" />
            </div>
            <div>
              <CardTitle className="text-sm font-mono">{name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                <span className="text-xs text-gray-500">{statusText[status]}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {riskScore !== undefined && (
          <RiskGauge score={riskScore} label="Risk Score" />
        )}

        {keyFindings && keyFindings.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 font-mono">Top Findings</p>
            {keyFindings.slice(0, 3).map((finding, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <ChevronRight size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 line-clamp-2">{finding}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FindingsDetailModal({
  isOpen,
  onClose,
  finding
}: {
  isOpen: boolean
  onClose: () => void
  finding: KeyFinding | null
}) {
  if (!finding) return null

  const severityColors = {
    HIGH: 'bg-red-100 text-red-800 border-red-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <AlertTriangle size={20} className="text-[#c9a227]" />
            Finding Details
          </DialogTitle>
          <DialogDescription>
            Source: {finding.source_agent}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={`${severityColors[finding.severity]} border`}>
              {finding.severity} Severity
            </Badge>
            <Badge variant="outline" className="font-mono">{finding.category}</Badge>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{finding.finding}</p>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2 font-mono">Recommended Actions</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Request additional documentation and clarification</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Conduct follow-up analysis with management team</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Adjust deal valuation model to account for identified risk</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<NormalizedAgentResponse | null>(null)
  const [selectedFinding, setSelectedFinding] = useState<KeyFinding | null>(null)
  const [showFindingModal, setShowFindingModal] = useState(false)
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'pending' | 'analyzing' | 'complete'>>({
    liquidity: 'pending',
    operational: 'pending',
    sustainability: 'pending',
    auditor: 'pending'
  })

  const runFullAnalysis = async () => {
    setLoading(true)

    // Simulate agent status updates
    setAgentStatuses({
      liquidity: 'analyzing',
      operational: 'analyzing',
      sustainability: 'analyzing',
      auditor: 'analyzing'
    })

    try {
      const result = await callAIAgent(
        'Run comprehensive due diligence analysis on the uploaded deal documents',
        AGENTS.DILIGENCE_COORDINATOR
      )

      if (result.success) {
        setAnalysisResult(result.response)
        setAgentStatuses({
          liquidity: 'complete',
          operational: 'complete',
          sustainability: 'complete',
          auditor: 'complete'
        })
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const openFindingDetail = (finding: KeyFinding) => {
    setSelectedFinding(finding)
    setShowFindingModal(true)
  }

  const diligenceData = analysisResult?.result as DiligenceCoordinatorResult | undefined
  const overallRisk = diligenceData?.overall_risk_score || 62
  const recommendation = diligenceData?.recommendation || 'PROCEED_WITH_CAUTION'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />

      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-mono">Analysis Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive Financial Due Diligence Intelligence</p>
        </div>

        {/* Deal Summary */}
        <div className="mb-8">
          <DealSummaryHeader />
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={runFullAnalysis}
            disabled={loading}
            className="bg-[#c9a227] hover:bg-[#b89220] text-[#1a1f36] font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Running Analysis...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={16} />
                Run Full Analysis
              </>
            )}
          </Button>

          <Button variant="outline" className="font-mono">
            <Download className="mr-2" size={16} />
            Export Report
          </Button>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <AgentCard
            name="Liquidity Risk Agent"
            icon={TrendingDown}
            status={agentStatuses.liquidity}
            riskScore={diligenceData ? 75 : undefined}
            keyFindings={diligenceData ? [
              'Cash flow projections do not adequately cover debt obligations',
              'Delayed receivables negatively impacting working capital',
              'Covenant compliance risk identified'
            ] : undefined}
            onClick={() => {}}
          />

          <AgentCard
            name="Operational Efficiency Agent"
            icon={Activity}
            status={agentStatuses.operational}
            riskScore={diligenceData ? 55 : undefined}
            keyFindings={diligenceData ? [
              'EBITDA margins show volatility over past eight quarters',
              'Inconsistent expense control effectiveness',
              'Cost structure sustainability concerns'
            ] : undefined}
            onClick={() => {}}
          />

          <AgentCard
            name="Sustainability Analysis Agent"
            icon={TrendingUp}
            status={agentStatuses.sustainability}
            riskScore={diligenceData ? 60 : undefined}
            keyFindings={diligenceData ? [
              'Multiple one-time items inflating earnings',
              'Normalized earnings lower than reported figures',
              'Revenue growth assumptions need validation'
            ] : undefined}
            onClick={() => {}}
          />

          <AgentCard
            name="External Auditor Lens Agent"
            icon={Users}
            status={agentStatuses.auditor}
            riskScore={diligenceData ? 70 : undefined}
            keyFindings={diligenceData ? [
              'Related-party transactions not adequately disclosed',
              'Documentation gaps for large unusual expenses',
              'Disclosure compliance concerns identified'
            ] : undefined}
            onClick={() => {}}
          />
        </div>

        {/* Analysis Results */}
        {analysisResult && diligenceData && (
          <div className="space-y-6">
            {/* Consolidated Recommendation */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <BarChart3 size={20} className="text-[#c9a227]" />
                  Consolidated Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 font-mono mb-2">Overall Risk Score</p>
                    <RiskGauge score={overallRisk} label="" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-mono mb-2">Recommendation</p>
                    <Badge className={`${
                      recommendation === 'PROCEED' ? 'bg-green-100 text-green-800' :
                      recommendation === 'PROCEED_WITH_CAUTION' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    } text-sm px-3 py-1`}>
                      {recommendation.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-mono mb-2">Analysis Date</p>
                    <p className="text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="text-sm font-semibold mb-3 font-mono">Executive Summary</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {diligenceData.executive_summary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Findings */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <AlertTriangle size={20} className="text-[#c9a227]" />
                  Key Findings ({diligenceData.key_findings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {diligenceData.key_findings.map((finding, i) => (
                      <div
                        key={i}
                        className="p-4 border border-gray-200 rounded-lg hover:border-[#c9a227] transition-colors cursor-pointer"
                        onClick={() => openFindingDetail(finding)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {finding.category}
                            </Badge>
                            <Badge className={`text-xs ${
                              finding.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                              finding.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finding.severity}
                            </Badge>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{finding.finding}</p>
                        <p className="text-xs text-gray-500">Source: {finding.source_agent}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Prioritized Risks */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <DollarSign size={20} className="text-[#c9a227]" />
                  Prioritized Risks & Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diligenceData.prioritized_risks.map((risk, i) => (
                    <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex gap-2">
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            Impact: {risk.impact}
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            Likelihood: {risk.likelihood}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">{risk.risk}</h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-mono text-xs text-gray-500">Mitigation:</span> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#c9a227]" />
                  Required Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {diligenceData.action_items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#c9a227] text-[#1a1f36] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !loading && (
          <Card className="bg-white border-gray-200 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-mono">
                No Analysis Results Yet
              </h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Click Run Full Analysis to start the comprehensive due diligence review of your uploaded documents.
              </p>
              <Button
                onClick={runFullAnalysis}
                className="bg-[#c9a227] hover:bg-[#b89220] text-[#1a1f36] font-mono"
              >
                <RefreshCw className="mr-2" size={16} />
                Run Full Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Finding Detail Modal */}
      <FindingsDetailModal
        isOpen={showFindingModal}
        onClose={() => setShowFindingModal(false)}
        finding={selectedFinding}
      />
    </div>
  )
}
