import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import RouteErrorBoundary from '../components/feedback/RouteErrorBoundary'
import NestedRouteRedirect from '../components/feedback/NestedRouteRedirect'
import QuestionManagementPage from '../pages/test-management/QuestionManagementPage'
import TestConfigurationPage from '../pages/test-management/TestConfigurationPage'
import TestIntegrationPage from '../pages/test-management/TestIntegrationPage'
import ResultsAnalyticsPage from '../pages/test-management/ResultsAnalyticsPage'
import ResultsAnalyticsEnginePage from '../pages/test-management/ResultsAnalyticsEnginePage'
import EvaluationManagementPage from '../pages/test-management/EvaluationManagementPage'
import EvaluationWorkspacePage from '../pages/test-management/EvaluationWorkspacePage'

export default function TestManagementLayout() {
  const location = useLocation()

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl">
        <RouteErrorBoundary resetKey={location.pathname}>
          <Routes>
            <Route index element={<Navigate to="question-management" replace />} />
            <Route path="question-management" element={<QuestionManagementPage />} />
            <Route path="test-configuration" element={<TestConfigurationPage />} />
            <Route path="test-integration" element={<TestIntegrationPage />} />
            {/* Backward compatible legacy route */}
            <Route path="results-analytics" element={<ResultsAnalyticsPage />} />
            <Route path="results-analytics-engine" element={<ResultsAnalyticsEnginePage />} />
            <Route path="evaluation-management" element={<EvaluationManagementPage />} />
            <Route path="evaluation-management/:evaluationId" element={<EvaluationWorkspacePage />} />
            <Route path="*" element={<NestedRouteRedirect defaultSegment="question-management" />} />
          </Routes>
        </RouteErrorBoundary>
      </section>
    </div>
  )
}

