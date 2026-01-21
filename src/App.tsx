import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AgentInterceptorProvider } from '@/components/AgentInterceptorProvider'
import ErrorBoundary, { GlobalErrorModal } from '@/components/ErrorBoundary'
import Home from './pages/Home'
import DocumentLibrary from './pages/DocumentLibrary'
import AuditTrail from './pages/AuditTrail'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AgentInterceptorProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/documents" element={<DocumentLibrary />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AgentInterceptorProvider>
        <GlobalErrorModal />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
