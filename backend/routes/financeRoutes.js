import { Router } from 'express'
import { financeRbac } from '../middleware/financeRbac.js'
import {
  centerDashboard,
  centerPerformance,
  centerRanking,
  compareCentersHandler,
  overallDashboard,
} from '../controllers/financeCenterController.js'
import {
  approveOfflinePayment,
  generateReceipt,
  getCommunicationLogs,
  getEmiPlans,
  getFinanceDashboard,
  getGstSettings,
  getOfflineApprovals,
  getPaymentAttemptLogs,
  getPaymentReportById,
  getPaymentReports,
  getStudentFinanceProfiles,
  getVerificationQueue,
  resendReceipt,
  sendPaymentReminder,
  updateEmiPlan,
  updateGstSettings,
  updatePaymentStatus,
} from '../controllers/financeController.js'

const router = Router()

router.use('/payments', financeRbac)
router.get('/payments/overall-dashboard', overallDashboard)
router.get('/payments/center/:centerId', centerDashboard)
router.get('/payments/compare-centers', compareCentersHandler)
router.get('/payments/center-performance', centerPerformance)
router.get('/payments/center-ranking', centerRanking)

router.get('/dashboard', getFinanceDashboard)
router.get('/reports', getPaymentReports)
router.get('/reports/:id', getPaymentReportById)
router.patch('/reports/:id/status', updatePaymentStatus)
router.get('/offline-approvals', getOfflineApprovals)
router.post('/offline-approvals/:id/decision', approveOfflinePayment)
router.get('/emi', getEmiPlans)
router.put('/emi/:planId', updateEmiPlan)
router.get('/profiles', getStudentFinanceProfiles)
router.get('/attempts', getPaymentAttemptLogs)
router.get('/communication-logs', getCommunicationLogs)
router.post('/reminders', sendPaymentReminder)
router.get('/verification', getVerificationQueue)
router.get('/gst-settings', getGstSettings)
router.put('/gst-settings', updateGstSettings)
router.post('/receipts/:paymentId/generate', generateReceipt)
router.post('/receipts/:paymentId/resend', resendReceipt)

export default router
