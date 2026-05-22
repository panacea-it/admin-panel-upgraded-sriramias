import { isFrontendOnly } from '../config/appMode'
import api from './axiosInstance'
import {
  MOCK_PAYMENT_REPORTS,
  MOCK_OFFLINE_REQUESTS,
  MOCK_EMI_PLANS,
  MOCK_STUDENT_PROFILES,
  MOCK_ATTEMPT_LOGS,
  MOCK_COMMUNICATION_LOGS,
  MOCK_GST_SETTINGS,
  MOCK_DASHBOARD,
  MOCK_VERIFICATION_QUEUE,
  buildFinanceDashboardPayload,
} from '../data/financeMockData'

const USE_MOCK = isFrontendOnly || import.meta.env.VITE_FINANCE_USE_MOCK !== 'false'

let mockReports = [...MOCK_PAYMENT_REPORTS]
let mockOffline = [...MOCK_OFFLINE_REQUESTS]
let mockEmi = JSON.parse(JSON.stringify(MOCK_EMI_PLANS))
let mockGst = { ...MOCK_GST_SETTINGS, branchGst: [...MOCK_GST_SETTINGS.branchGst] }
let mockComm = [...MOCK_COMMUNICATION_LOGS]

async function tryApi(fn, fallback) {
  if (USE_MOCK) return fallback()
  try {
    const res = await fn()
    const body = res.data
    return body?.data ?? body
  } catch {
    return fallback()
  }
}

export async function fetchFinanceDashboard(params = {}) {
  return tryApi(
    () => api.get('/finance/dashboard', { params }),
    () => buildFinanceDashboardPayload(params),
  )
}

export async function fetchOverallFinanceDashboard(params = {}) {
  return tryApi(
    () => api.get('/finance/payments/overall-dashboard', { params: { ...params, scope: 'overall' } }),
    () => buildFinanceDashboardPayload({ ...params, scope: 'overall' }),
  )
}

export async function fetchCenterFinanceDashboard(centerId, params = {}) {
  return tryApi(
    () => api.get(`/finance/payments/center/${centerId}`, { params }),
    () =>
      buildFinanceDashboardPayload({
        ...params,
        scope: 'center',
        centerIds: centerId,
      }),
  )
}

export async function fetchCompareCentersFinance(params = {}) {
  return tryApi(
    () => api.get('/finance/payments/compare-centers', { params }),
    () =>
      buildFinanceDashboardPayload({
        ...params,
        scope: 'compare',
      }),
  )
}

export async function fetchCenterPerformance() {
  return tryApi(
    () => api.get('/finance/payments/center-performance'),
    () => {
      const d = buildFinanceDashboardPayload({ scope: 'overall' })
      return { summaries: d.centerSummaries, performance: d.performance }
    },
  )
}

export async function fetchCenterRanking() {
  return tryApi(
    () => api.get('/finance/payments/center-ranking'),
    () => buildFinanceDashboardPayload({ scope: 'overall' }).centerRanking,
  )
}

/** Unified loader for Payment Dashboard — respects center filter from navbar */
export async function fetchPaymentDashboardByScope(params = {}) {
  const { scope = 'overall', centerIds, centerNames, course, month } = params

  if (scope === 'compare' && centerNames) {
    return tryApi(
      () => api.get('/finance/payments/compare-centers', { params: { centerIds, centerNames, course, month } }),
      () => buildFinanceDashboardPayload({ scope: 'compare', centerIds, centerNames, course, month }),
    )
  }

  if (scope === 'center' && centerNames) {
    return tryApi(
      () =>
        api.get(`/finance/payments/center/${String(centerIds).split(',')[0]}`, {
          params: { centerNames, course, month },
        }),
      () => buildFinanceDashboardPayload({ scope: 'center', centerIds, centerNames, course, month }),
    )
  }

  if (scope === 'multi' && centerNames) {
    return tryApi(
      () => api.get('/finance/payments/overall-dashboard', { params: { centerIds, centerNames, course, month, scope: 'multi' } }),
      () => buildFinanceDashboardPayload({ scope: 'multi', centerIds, centerNames, course, month }),
    )
  }

  return tryApi(
    () => api.get('/finance/payments/overall-dashboard', { params: { course, month, scope: 'overall' } }),
    () => buildFinanceDashboardPayload({ scope: 'overall', course, month }),
  )
}

export async function fetchPaymentReports(params = {}) {
  return tryApi(
    () => api.get('/finance/reports', { params }),
    () => [...mockReports],
  )
}

export async function fetchPaymentReportById(id) {
  return tryApi(
    () => api.get(`/finance/reports/${id}`),
    () => mockReports.find((r) => r.id === id) || null,
  )
}

export async function updatePaymentStatus(id, payload) {
  return tryApi(
    () => api.patch(`/finance/reports/${id}/status`, payload),
    () => {
      mockReports = mockReports.map((r) =>
        r.id === id
          ? {
              ...r,
              paymentStatus: payload.newStatus || r.paymentStatus,
              amountPaid: payload.amountAdjustment != null ? Number(payload.amountAdjustment) : r.amountPaid,
              paymentMode: payload.paymentMode || r.paymentMode,
              transactionId: payload.transactionId || r.transactionId,
              paymentDate: payload.paymentDate || r.paymentDate,
              adminLogs: [
                ...(r.adminLogs || []),
                {
                  adminName: payload.adminName || 'Admin',
                  action: `Status → ${payload.newStatus}`,
                  comment: payload.comment,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : r,
      )
      return mockReports.find((r) => r.id === id)
    },
  )
}

export async function fetchOfflineApprovals() {
  return tryApi(
    () => api.get('/finance/offline-approvals'),
    () => [...mockOffline],
  )
}

export async function approveOfflinePayment(id, payload) {
  return tryApi(
    () => api.post(`/finance/offline-approvals/${id}/decision`, payload),
    () => {
      mockOffline = mockOffline.map((o) =>
        o.id === id ? { ...o, status: payload.newStatus === 'Approved' ? 'Approved' : 'Rejected' } : o,
      )
      return mockOffline.find((o) => o.id === id)
    },
  )
}

export async function fetchEmiPlans(params = {}) {
  return tryApi(
    () => api.get('/finance/emi', { params }),
    () => JSON.parse(JSON.stringify(mockEmi)),
  )
}

export async function updateEmiPlan(planId, installments) {
  return tryApi(
    () => api.put(`/finance/emi/${planId}`, { installments }),
    () => {
      mockEmi = mockEmi.map((p) => (p.id === planId ? { ...p, installments } : p))
      return mockEmi.find((p) => p.id === planId)
    },
  )
}

export async function fetchStudentFinanceProfiles() {
  return tryApi(
    () => api.get('/finance/profiles'),
    () => [...MOCK_STUDENT_PROFILES],
  )
}

export async function fetchPaymentAttemptLogs(params = {}) {
  return tryApi(
    () => api.get('/finance/attempts', { params }),
    () => [...MOCK_ATTEMPT_LOGS],
  )
}

export async function fetchCommunicationLogs() {
  return tryApi(
    () => api.get('/finance/communication-logs'),
    () => [...mockComm],
  )
}

export async function sendPaymentReminder(payload) {
  return tryApi(
    () => api.post('/finance/reminders', payload),
    () => {
      mockComm.unshift({
        id: `COM-${Date.now()}`,
        recipient: payload.mobile || payload.email,
        type: 'Payment Reminder',
        channel: payload.channel || 'WhatsApp',
        status: 'Queued',
        timestamp: new Date().toISOString(),
      })
      return { success: true }
    },
  )
}

export async function fetchVerificationQueue() {
  return tryApi(
    () => api.get('/finance/verification'),
    () => [...MOCK_VERIFICATION_QUEUE],
  )
}

export async function fetchGstSettings() {
  return tryApi(
    () => api.get('/finance/gst-settings'),
    () => ({ ...mockGst }),
  )
}

export async function updateGstSettings(payload) {
  return tryApi(
    () => api.put('/finance/gst-settings', payload),
    () => {
      mockGst = { ...mockGst, ...payload }
      return mockGst
    },
  )
}

export async function generateReceipt(paymentId) {
  return tryApi(
    () => api.post(`/finance/receipts/${paymentId}/generate`),
    () => mockReports.find((r) => r.id === paymentId),
  )
}

export async function resendReceipt(paymentId, channel) {
  return tryApi(
    () => api.post(`/finance/receipts/${paymentId}/resend`, { channel }),
    () => ({ success: true, channel }),
  )
}
