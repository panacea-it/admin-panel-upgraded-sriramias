import { FileQuestion, Settings2, Plug, BarChart3, ClipboardCheck } from 'lucide-react'

export const TEST_MANAGEMENT_BASE = '/test-management'

export const TEST_MANAGEMENT_ROUTES = {
  questionManagement: `${TEST_MANAGEMENT_BASE}/question-management`,
  testConfiguration: `${TEST_MANAGEMENT_BASE}/test-configuration`,
  testIntegration: `${TEST_MANAGEMENT_BASE}/test-integration`,
  resultsAnalytics: `${TEST_MANAGEMENT_BASE}/results-analytics`,
  resultsAnalyticsEngine: `${TEST_MANAGEMENT_BASE}/results-analytics-engine`,
  evaluationManagement: `${TEST_MANAGEMENT_BASE}/evaluation-management`,
}

export const TEST_MANAGEMENT_NAV_ITEMS = [
  { label: 'Question Management', path: TEST_MANAGEMENT_ROUTES.questionManagement, icon: FileQuestion },
  { label: 'Test Configuration', path: TEST_MANAGEMENT_ROUTES.testConfiguration, icon: Settings2 },
  { label: 'Test Integration', path: TEST_MANAGEMENT_ROUTES.testIntegration, icon: Plug },
  { label: 'Result & Analytics Engine', path: TEST_MANAGEMENT_ROUTES.resultsAnalyticsEngine, icon: BarChart3 },
  { label: 'Evaluation Management', path: TEST_MANAGEMENT_ROUTES.evaluationManagement, icon: ClipboardCheck },
]

export function isTestManagementPath(pathname) {
  return pathname === TEST_MANAGEMENT_BASE || pathname.startsWith(`${TEST_MANAGEMENT_BASE}/`)
}

