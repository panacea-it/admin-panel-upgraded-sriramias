import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import RouteErrorBoundary from '../components/feedback/RouteErrorBoundary'
import NestedRouteRedirect from '../components/feedback/NestedRouteRedirect'

const TestManagementDashboardPage = lazy(
  () => import('../pages/test-management/TestManagementDashboardPage'),
)
const CbtManagementPage = lazy(() => import('../pages/test-management/CbtManagementPage'))
const CbtFacultyDetailPage = lazy(() => import('../pages/test-management/CbtFacultyDetailPage'))
const CbtStudentResultsPage = lazy(() => import('../pages/test-management/CbtStudentResultsPage'))
const MainsManagementPage = lazy(() => import('../pages/test-management/MainsManagementPage'))
const MainsFacultyDetailPage = lazy(() => import('../pages/test-management/MainsFacultyDetailPage'))
const MainsTopicDetailPage = lazy(() => import('../pages/test-management/MainsTopicDetailPage'))
const MainsEvaluationResultsPage = lazy(
  () => import('../pages/test-management/MainsEvaluationResultsPage'),
)
const CbtTopicDetailPage = lazy(() => import('../pages/test-management/CbtTopicDetailPage'))
const QuestionManagementPage = lazy(
  () => import('../pages/test-management/QuestionManagementPage'),
)
const EvaluationOversightPage = lazy(
  () => import('../pages/test-management/EvaluationOversightPage'),
)
const EvaluationWorkspacePage = lazy(
  () => import('../pages/test-management/EvaluationWorkspacePage'),
)
const EvaluatorAssignmentPage = lazy(
  () => import('../pages/test-management/EvaluatorAssignmentPage'),
)
const TestManagementAnalyticsPage = lazy(
  () => import('../pages/test-management/TestManagementAnalyticsPage'),
)

function PageFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#55ace7] border-t-transparent" />
    </div>
  )
}

export default function TestManagementLayout() {
  const location = useLocation()

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl">
        <RouteErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TestManagementDashboardPage />} />
              <Route path="cbt" element={<CbtManagementPage />} />
              <Route path="cbt/faculty/:subjectId" element={<CbtFacultyDetailPage />} />
              <Route path="cbt/faculty/:subjectId/topic/:topicId" element={<CbtTopicDetailPage />} />
              <Route
                path="cbt/faculty/:subjectId/results/:testItemId"
                element={<CbtStudentResultsPage />}
              />
              <Route path="mains" element={<MainsManagementPage />} />
              <Route path="mains/faculty/:subjectId" element={<MainsFacultyDetailPage />} />
              <Route path="mains/faculty/:subjectId/topic/:topicId" element={<MainsTopicDetailPage />} />
              <Route
                path="mains/faculty/:subjectId/topic/:topicId/results/:testItemId"
                element={<MainsEvaluationResultsPage />}
              />
              <Route path="question-bank" element={<QuestionManagementPage />} />
              <Route path="evaluations" element={<EvaluationOversightPage />} />
              <Route path="evaluations/assign" element={<EvaluatorAssignmentPage />} />
              <Route path="evaluations/workspace/:paperId" element={<EvaluationWorkspacePage />} />
              <Route path="analytics" element={<TestManagementAnalyticsPage />} />
              {/* Legacy routes → new structure */}
              <Route path="question-management" element={<Navigate to="../question-bank" replace />} />
              <Route path="test-configuration" element={<Navigate to="../cbt" replace />} />
              <Route path="test-integration" element={<Navigate to="../cbt" replace />} />
              <Route path="results-analytics" element={<Navigate to="../analytics" replace />} />
              <Route path="results-analytics-engine" element={<Navigate to="../analytics" replace />} />
              <Route path="evaluation-management" element={<Navigate to="../evaluations" replace />} />
              <Route path="evaluation-management/*" element={<Navigate to="../evaluations" replace />} />
              <Route path="*" element={<NestedRouteRedirect defaultSegment="dashboard" />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </section>
    </div>
  )
}
