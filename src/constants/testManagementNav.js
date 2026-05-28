import {
  LayoutDashboard,
  Monitor,
  ListChecks,
  Database,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react'

export const TEST_MANAGEMENT_BASE = '/test-management'

export const TEST_MANAGEMENT_ROUTES = {
  dashboard: `${TEST_MANAGEMENT_BASE}/dashboard`,
  cbt: `${TEST_MANAGEMENT_BASE}/cbt`,
  cbtFaculty: (subjectId) => `${TEST_MANAGEMENT_BASE}/cbt/faculty/${encodeURIComponent(String(subjectId))}`,
  cbtResults: (subjectId, testItemId) =>
    `${TEST_MANAGEMENT_BASE}/cbt/faculty/${encodeURIComponent(String(subjectId))}/results/${encodeURIComponent(String(testItemId))}`,
  cbtTopic: (subjectId, topicId) =>
    `${TEST_MANAGEMENT_BASE}/cbt/faculty/${encodeURIComponent(String(subjectId))}/topic/${encodeURIComponent(String(topicId))}`,
  mains: `${TEST_MANAGEMENT_BASE}/mains`,
  mainsFaculty: (subjectId) =>
    `${TEST_MANAGEMENT_BASE}/mains/faculty/${encodeURIComponent(String(subjectId))}`,
  mainsTopic: (subjectId, topicId) =>
    `${TEST_MANAGEMENT_BASE}/mains/faculty/${encodeURIComponent(String(subjectId))}/topic/${encodeURIComponent(String(topicId))}`,
  mainsResults: (subjectId, topicId, testItemId) =>
    `${TEST_MANAGEMENT_BASE}/mains/faculty/${encodeURIComponent(String(subjectId))}/topic/${encodeURIComponent(String(topicId))}/results/${encodeURIComponent(String(testItemId))}`,
  questionBank: `${TEST_MANAGEMENT_BASE}/question-bank`,
  evaluations: `${TEST_MANAGEMENT_BASE}/evaluations`,
  evaluationWorkspace: (paperId) =>
    `${TEST_MANAGEMENT_BASE}/evaluations/workspace/${encodeURIComponent(String(paperId))}`,
  evaluationAssign: `${TEST_MANAGEMENT_BASE}/evaluations/assign`,
  analytics: `${TEST_MANAGEMENT_BASE}/analytics`,
}

export const TEST_MANAGEMENT_NAV_ITEMS = [
  { label: 'Dashboard', path: TEST_MANAGEMENT_ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'CBT Management', path: TEST_MANAGEMENT_ROUTES.cbt, icon: Monitor },
  { label: 'Mains Management', path: TEST_MANAGEMENT_ROUTES.mains, icon: ListChecks },
  { label: 'Question Bank', path: TEST_MANAGEMENT_ROUTES.questionBank, icon: Database },
  { label: 'Evaluation Oversight', path: TEST_MANAGEMENT_ROUTES.evaluations, icon: ClipboardCheck },
  { label: 'Analytics', path: TEST_MANAGEMENT_ROUTES.analytics, icon: BarChart3 },
]

export function isTestManagementPath(pathname) {
  return pathname === TEST_MANAGEMENT_BASE || pathname.startsWith(`${TEST_MANAGEMENT_BASE}/`)
}
