import { isFrontendOnly } from '../config/appMode'
import api from './axiosInstance'
import {
  MOCK_PAYMENT_REPORTS,
  MOCK_PAYMENTS_ENRICHED,
  MOCK_OFFLINE_REQUESTS,
  MOCK_EMI_PLANS,
  MOCK_STUDENT_PROFILES,
  MOCK_ATTEMPT_LOGS,
  MOCK_COMMUNICATION_LOGS,
  MOCK_GST_SETTINGS,
  buildFinanceDashboardPayload,
} from '../data/financeMockData'
import { INITIAL_VERIFICATION_QUEUE } from '../data/financeVerificationData'
import { enrichFinanceRows } from '../utils/financeRecordModel'
import {
  filterCompletedReceipts,
  mapReceiptCenterRow,
  ensureReceiptOnRecord,
} from '../utils/receiptCompletion'

const USE_MOCK = isFrontendOnly || import.meta.env.VITE_FINANCE_USE_MOCK !== 'false'

let mockReports = enrichFinanceRows([...MOCK_PAYMENTS_ENRICHED])
let mockVerificationQueue = JSON.parse(JSON.stringify(INITIAL_VERIFICATION_QUEUE))
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
    () => enrichFinanceRows([...mockReports]),
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

export async function updateEmiPlan(planId, installments, planPatch = {}) {
  return tryApi(
    () => api.put(`/finance/emi/${planId}`, { installments, ...planPatch }),
    () => {
      mockEmi = mockEmi.map((p) => {
        if (p.id !== planId) return p
        const paid = (installments || [])
          .reduce((s, i) => s + (Number(i.paidAmount) || (i.status === 'Paid' ? Number(i.emiAmount) : 0)), 0)
        const pending = Math.max(0, (p.totalFees || 0) - paid)
        return {
          ...p,
          ...planPatch,
          installments,
          totalPaid: paid,
          pendingAmount: pending,
          completionPercent: p.totalFees
            ? Math.min(100, Math.round((paid / p.totalFees) * 100))
            : 0,
        }
      })
      return mockEmi.find((p) => p.id === planId)
    },
  )
}

export async function createEmiPlan(payload) {
  return tryApi(
    () => api.post('/finance/emi', payload),
    () => {
      const paid = (payload.installments || [])
        .filter((i) => i.status === 'Paid')
        .reduce((s, i) => s + (Number(i.emiAmount) || 0), 0)
      const down = Number(payload.downPayment) || 0
      const totalPaid = (payload.existingPaid || 0) + down + paid
      const pending = Math.max(0, (payload.totalFees || 0) - totalPaid)
      const plan = {
        id: `EMI-${Date.now().toString().slice(-6)}`,
        studentId: payload.studentId,
        studentName: payload.studentName,
        courseId: payload.courseId,
        courseName: payload.courseName,
        totalFees: payload.totalFees || payload.finalPayable || 0,
        totalPaid,
        pendingAmount: pending,
        completionPercent: payload.totalFees
          ? Math.min(100, Math.round((totalPaid / payload.totalFees) * 100))
          : 0,
        installments: (payload.installments || []).map((i) => ({
          emiNo: i.installmentNo ?? i.emiNo,
          emiDate: i.dueDate,
          emiAmount: i.emiAmount,
          status: i.status === 'Scheduled' ? 'Due' : i.status,
          dueDate: i.dueDate,
          paidDate: i.paidDate || '',
          paymentMode: i.paymentMode || '',
          receipt: i.receipt || null,
          referenceNumber: i.referenceNumber || i.utrNumber || '',
          remarks: i.remarks || '',
        })),
        audit: payload.audit || [],
        createdAt: new Date().toISOString(),
      }
      mockEmi = [...mockEmi, plan]
      return plan
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

function queueItemToReport(item, overrides = {}) {
  const now = new Date().toISOString()
  const amount = Number(item.amount) || 0
  return {
    id: item.id,
    studentId: item.studentId,
    studentName: item.student,
    mobile: item.mobile || '',
    email: item.email || '',
    courseId: item.courseId,
    courseName: item.course,
    courseType: item.courseType || 'Offline',
    centerId: item.centerId,
    centerName: item.centerName,
    batchId: item.batchId || 'batch-morning',
    batchName: item.batchName,
    paymentStatus: 'Paid',
    verificationStatus: 'Approved',
    paymentType: item.paymentType || 'Full',
    paymentMode: item.paymentMode,
    amountPaid: amount,
    pendingAmount: 0,
    totalFees: amount,
    gst: Math.round(amount * 0.18),
    transactionId: item.utrNumber,
    utrNumber: item.utrNumber,
    paymentDate: item.submittedAt || item.paymentDate || now,
    paymentProof: item.paymentProof,
    branch: item.centerName,
    receiptNumber: item.receiptNumber || `RCP-${item.id}`,
    adminLogs: [
      ...(item.auditTrail || []).map((a) => ({
        adminName: a.by,
        action: a.action,
        comment: '',
        timestamp: a.at,
      })),
      {
        adminName: overrides.adminName || 'Verifier',
        action: overrides.action || 'Verification approved',
        comment: overrides.comment || item.remarks || '',
        timestamp: now,
      },
    ],
    timeline: [
      { event: 'Payment verified', timestamp: now },
      { event: 'Moved to payment reports', timestamp: now },
    ],
    ...overrides,
  }
}

function upsertPaymentReport(report) {
  const enriched = enrichFinanceRows([report])[0]
  const idx = mockReports.findIndex((r) => r.id === enriched.id)
  if (idx >= 0) {
    mockReports = mockReports.map((r, i) => (i === idx ? { ...r, ...enriched } : r))
  } else {
    mockReports = [...mockReports, enriched]
  }
  return mockReports.find((r) => r.id === enriched.id)
}

export async function fetchVerificationQueue() {
  return tryApi(
    () => api.get('/finance/verification'),
    () => JSON.parse(JSON.stringify(mockVerificationQueue)),
  )
}

export async function approveVerification(id, payload = {}) {
  return tryApi(
    () => api.post(`/finance/verification/${id}/approve`, payload),
    () => {
      const item = mockVerificationQueue.find((r) => r.id === id)
      if (!item) throw new Error('Not found')
      mockVerificationQueue = mockVerificationQueue.filter((r) => r.id !== id)
      const report = queueItemToReport(item, {
        adminName: payload.adminName || 'Verifier',
        action: 'Verification approved',
        comment: payload.comment || 'Payment verified successfully',
      })
      return upsertPaymentReport(report)
    },
  )
}

export async function rejectVerification(id, payload = {}) {
  return tryApi(
    () => api.post(`/finance/verification/${id}/reject`, payload),
    () => {
      const remark = [payload.reason, payload.comment].filter(Boolean).join(' — ')
      mockVerificationQueue = mockVerificationQueue.map((r) =>
        r.id === id
          ? {
              ...r,
              verificationStatus: 'Rejected',
              remarks: remark || r.remarks,
              verifiedBy: payload.adminName || 'Verifier',
              auditTrail: [
                ...(r.auditTrail || []),
                { by: payload.adminName || 'Verifier', action: 'Rejected', at: new Date().toISOString() },
              ],
            }
          : r,
      )
      return mockVerificationQueue.find((r) => r.id === id)
    },
  )
}

export async function escalateVerification(id, payload = {}) {
  return tryApi(
    () => api.post(`/finance/verification/${id}/escalate`, payload),
    () => {
      mockVerificationQueue = mockVerificationQueue.map((r) =>
        r.id === id
          ? {
              ...r,
              verificationStatus: 'Escalated',
              remarks: payload.remark || r.remarks,
              auditTrail: [
                ...(r.auditTrail || []),
                {
                  by: payload.adminName || 'Finance Admin',
                  action: 'Escalated',
                  at: new Date().toISOString(),
                },
              ],
            }
          : r,
      )
      return mockVerificationQueue.find((r) => r.id === id)
    },
  )
}

export async function requestVerificationReupload(id, payload = {}) {
  return tryApi(
    () => api.post(`/finance/verification/${id}/reupload`, payload),
    () => {
      mockVerificationQueue = mockVerificationQueue.map((r) =>
        r.id === id
          ? {
              ...r,
              verificationStatus: 'Under Review',
              remarks: payload.note || payload.comment || 'Re-upload requested — awaiting new proof',
              auditTrail: [
                ...(r.auditTrail || []),
                {
                  by: payload.adminName || 'Finance Admin',
                  action: 'Re-upload requested',
                  at: new Date().toISOString(),
                },
              ],
            }
          : r,
      )
      return mockVerificationQueue.find((r) => r.id === id)
    },
  )
}

export async function submitOfflinePaymentReport(form) {
  return tryApi(
    () => api.post('/finance/verification/offline', form),
    async () => {
      if (form.isDraft) {
        return { draft: true, paymentId: form.paymentId }
      }

      let emiPlanRecord = null
      if (form.emiPlan && (form.submitAction === 'emi_plan' || form.submitAction === 'approve')) {
        emiPlanRecord = await createEmiPlan({
          studentId: form.studentId,
          studentName: form.studentName,
          courseId: form.courseId,
          courseName: form.courseName,
          totalFees: form.emiPlan.totalFees || form.financials?.finalPayable,
          finalPayable: form.financials?.finalPayable,
          existingPaid: form.financials?.amountPaid || 0,
          downPayment: form.emiPlan.downPayment,
          installments: form.emiPlan.installments,
          frequency: form.emiPlan.frequency,
          startDate: form.emiPlan.startDate,
          audit: form.audit?.logs || [],
        })
      }

      if (form.submitAction === 'emi_plan') {
        return { emiPlan: emiPlanRecord }
      }

      const now = new Date().toISOString()
      const paymentDate = form.paymentDate ? new Date(form.paymentDate).toISOString() : now
      const utr =
        form.utrNumber ||
        form.modeFields?.receiptNumber ||
        form.modeFields?.chequeNumber ||
        form.modeFields?.ddNumber ||
        ''

      const item = {
        id: form.paymentId.trim(),
        studentId: form.studentId,
        student: form.studentName,
        centerName: form.centerName,
        course: form.courseName,
        courseId: form.courseId,
        courseType: form.courseType,
        amount: form.amount,
        paymentMode: form.paymentMode,
        utrNumber: utr,
        paymentProof: form.proofFileName,
        submittedAt: paymentDate,
        paymentDate,
        remarks: form.remarks || (form.emiEnabled ? 'Offline EMI down payment' : 'Offline payment added by admin'),
      }
      const report = queueItemToReport(item, {
        adminName: form.audit?.createdBy || 'Finance Admin',
        action: form.emiEnabled ? 'Offline EMI payment approved' : 'Offline payment added & approved',
        comment: form.remarks || '',
      })
      if (form.emiEnabled && emiPlanRecord) {
        report.paymentType = 'EMI'
        report.emiStatus = 'EMI Running'
        report.paymentStatus = report.pendingAmount > 0 ? 'Partial' : 'Paid'
      }
      const saved = upsertPaymentReport(report)
      return { report: saved, emiPlan: emiPlanRecord, receiptId: saved?.id }
    },
  )
}

export async function resetVerificationQueue() {
  return tryApi(
    () => api.post('/finance/verification/reset'),
    () => {
      mockVerificationQueue = JSON.parse(JSON.stringify(INITIAL_VERIFICATION_QUEUE))
      return mockVerificationQueue
    },
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

export async function fetchCompletedReceipts(params = {}) {
  return tryApi(
    () => api.get('/finance/receipts/completed', { params }),
    () => {
      const list = filterCompletedReceipts(mockReports).map((r) =>
        mapReceiptCenterRow(ensureReceiptOnRecord(r)),
      )
      return list
    },
  )
}

export async function sendReceiptCommunication(paymentId, { channel, mobile, email, message }) {
  const channelKey = String(channel || 'Email').toLowerCase()
  return tryApi(
    () =>
      api.post(`/finance/receipts/${paymentId}/send`, {
        channel,
        mobile,
        email,
        message,
      }),
    () => {
      const now = new Date().toISOString()
      mockReports = mockReports.map((r) => {
        if (r.id !== paymentId) return r
        const base = ensureReceiptOnRecord(r)
        const receiptCommunications = { ...(base.receiptCommunications || {}) }
        receiptCommunications[channelKey] = {
          status: 'Delivered',
          sentAt: now,
          sentBy: 'Finance Admin',
        }
        mockComm = [
          {
            id: `COM-RCP-${Date.now()}`,
            recipient: channelKey === 'email' ? email || base.email : mobile || base.mobile,
            type: 'Payment Receipt',
            channel: channel.charAt(0).toUpperCase() + channel.slice(1).toLowerCase(),
            status: 'Delivered',
            timestamp: now,
            message,
          },
          ...mockComm,
        ]
        return {
          ...base,
          receiptCommunications,
          receiptSentBy: 'Finance Admin',
          receiptSentAt: now,
        }
      })
      const updated = mockReports.find((r) => r.id === paymentId)
      return mapReceiptCenterRow(updated)
    },
  )
}

export async function generateReceipt(paymentId) {
  return tryApi(
    () => api.post(`/finance/receipts/${paymentId}/generate`),
    () => {
      mockReports = mockReports.map((r) =>
        r.id === paymentId ? ensureReceiptOnRecord(r) : r,
      )
      return mockReports.find((r) => r.id === paymentId)
    },
  )
}

export async function resendReceipt(paymentId, channel) {
  return sendReceiptCommunication(paymentId, { channel, message: '' })
}
