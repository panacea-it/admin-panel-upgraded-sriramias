import Payment from '../models/Payment.js'
import EmiPlan from '../models/EmiPlan.js'
import GstSettings from '../models/GstSettings.js'
import CommunicationLog from '../models/CommunicationLog.js'
import {
  SEED_PAYMENTS,
  SEED_OFFLINE,
  SEED_EMI_PLANS,
  SEED_COMM_LOGS,
  SEED_GST,
  buildSeedDashboard,
} from '../data/financeSeedData.js'

function toIso(value) {
  if (!value) return value === 0 ? 0 : ''
  if (value instanceof Date) return value.toISOString()
  return value
}

function mapPayment(doc) {
  if (!doc) return null
  const p = doc.toObject ? doc.toObject() : { ...doc }
  return {
    id: p.paymentId || String(p._id),
    studentId: p.studentId,
    studentName: p.studentName,
    mobile: p.mobile,
    email: p.email,
    courseId: p.courseId,
    courseName: p.courseName,
    courseType: p.courseType,
    paymentStatus: p.paymentStatus,
    paymentType: p.paymentType,
    paymentMode: p.paymentMode,
    amountPaid: p.amountPaid,
    pendingAmount: p.pendingAmount,
    totalFees: p.totalFees,
    gst: p.gst,
    transactionId: p.transactionId,
    paymentDate: toIso(p.paymentDate),
    branch: p.branch,
    attempts: (p.attempts || []).map((a) => ({
      ...a,
      dateTime: toIso(a.dateTime),
    })),
    adminLogs: (p.adminLogs || []).map((l) => ({
      ...l,
      timestamp: toIso(l.timestamp),
    })),
    timeline: (p.timeline || []).map((t) => ({
      ...t,
      timestamp: toIso(t.timestamp),
    })),
    receiptNumber: p.receiptNumber,
  }
}

function mapOffline(doc) {
  const p = doc.toObject ? doc.toObject() : { ...doc }
  return {
    id: p.paymentId || String(p._id),
    studentName: p.studentName,
    studentId: p.studentId,
    course: p.courseName,
    courseId: p.courseId,
    amount: p.amountPaid || p.totalFees,
    status: p.offlineStatus || 'Pending',
    requestedDate: toIso(p.requestedDate),
    paymentProof: p.paymentProof,
    paymentMode: p.paymentMode,
  }
}

function mapEmi(doc) {
  const p = doc.toObject ? doc.toObject() : { ...doc }
  return {
    id: p.planId || String(p._id),
    studentId: p.studentId,
    studentName: p.studentName,
    courseId: p.courseId,
    courseName: p.courseName,
    totalFees: p.totalFees,
    totalPaid: p.totalPaid,
    pendingAmount: p.pendingAmount,
    completionPercent: p.completionPercent,
    installments: p.installments || [],
  }
}

function mapComm(doc) {
  const c = doc.toObject ? doc.toObject() : { ...doc }
  return {
    id: c.logId || String(c._id),
    recipient: c.recipient,
    type: c.type,
    channel: c.channel,
    status: c.status,
    timestamp: toIso(c.timestamp),
  }
}

function mapGst(doc) {
  if (!doc) return { ...SEED_GST, branchGst: [...SEED_GST.branchGst] }
  const g = doc.toObject ? doc.toObject() : { ...doc }
  delete g._id
  delete g.__v
  delete g.key
  delete g.createdAt
  delete g.updatedAt
  return g
}

async function loadPayments(filter = {}) {
  const docs = await Payment.find({ isOfflineRequest: { $ne: true }, ...filter }).lean()
  if (docs.length) return docs.map((d) => mapPayment({ toObject: () => d }))
  return SEED_PAYMENTS.map(mapPayment)
}

async function loadOffline() {
  const docs = await Payment.find({ isOfflineRequest: true }).lean()
  if (docs.length) return docs.map((d) => mapOffline({ toObject: () => d }))
  return SEED_OFFLINE.map((o) =>
    mapOffline({
      toObject: () => ({
        ...o,
        courseName: o.courseName,
        offlineStatus: o.offlineStatus,
      }),
    }),
  )
}

async function loadEmiPlans() {
  const docs = await EmiPlan.find().lean()
  if (docs.length) return docs.map((d) => mapEmi({ toObject: () => d }))
  return SEED_EMI_PLANS.map((p) => mapEmi({ toObject: () => p }))
}

async function loadCommLogs() {
  const docs = await CommunicationLog.find().sort({ timestamp: -1 }).lean()
  if (docs.length) return docs.map((d) => mapComm({ toObject: () => d }))
  return SEED_COMM_LOGS.map((c) => mapComm({ toObject: () => c }))
}

async function loadGst() {
  const doc = await GstSettings.findOne({ key: 'default' }).lean()
  if (doc) return mapGst(doc)
  return mapGst(SEED_GST)
}

function buildProfiles(payments) {
  const byStudent = new Map()
  for (const p of payments) {
    if (!p.studentId) continue
    const existing = byStudent.get(p.studentId)
    const courseEntry = {
      courseId: p.courseId,
      courseName: p.courseName,
      courseType: p.courseType,
      paymentStatus:
        p.paymentStatus === 'Paid'
          ? 'Active'
          : p.paymentStatus === 'Partial'
            ? 'Pending Payment'
            : 'Pending Payment',
      date: p.paymentDate || '',
      paymentType: p.paymentType,
      paidAmount: p.amountPaid,
      pendingAmount: p.pendingAmount,
    }
    if (existing) {
      existing.totalPaid += p.amountPaid || 0
      existing.totalPending += p.pendingAmount || 0
      existing.courses.push(courseEntry)
    } else {
      byStudent.set(p.studentId, {
        id: p.studentId,
        studentName: p.studentName,
        mobile: p.mobile,
        email: p.email,
        branch: p.branch,
        totalPaid: p.amountPaid || 0,
        totalPending: p.pendingAmount || 0,
        courses: [courseEntry],
      })
    }
  }
  return [...byStudent.values()]
}

function buildAttemptLogs(payments) {
  return payments.flatMap((p) =>
    (p.attempts || []).map((a) => ({
      id: `${p.id}-${a.attemptNo}`,
      student: p.studentName,
      studentId: p.studentId,
      course: p.courseName,
      transactionId: a.transactionId,
      attemptNo: a.attemptNo,
      gatewayStatus: a.gatewayResponse,
      gatewayMessage: a.failureReason || 'OK',
      amount: p.totalFees,
      dateTime: a.dateTime,
      retryCount: Math.max(0, (a.attemptNo || 1) - 1),
      paymentMode: a.paymentMode,
      status: a.status,
    })),
  )
}

function buildVerificationQueue(payments) {
  return payments
    .filter((p) => p.paymentStatus === 'Pending' || p.paymentStatus === 'Partial')
    .map((p) => ({
      id: p.id,
      student: p.studentName,
      course: p.courseName,
      amount: p.pendingAmount || p.totalFees,
      status: p.paymentStatus,
      submittedAt: p.paymentDate || new Date().toISOString(),
    }))
}

function findPaymentById(payments, id) {
  return payments.find((p) => p.id === id || String(p._id) === id)
}

export async function getFinanceDashboard(req, res, next) {
  try {
    const payments = await loadPayments()
    const emiPlans = await loadEmiPlans()
    const offline = await loadOffline()
    const seedPayments = payments.map((p) => ({
      ...p,
      isOfflineRequest: false,
      offlineStatus: 'Pending',
    }))
    const dashboard = buildSeedDashboard(
      [...seedPayments, ...offline.map((o) => ({ amountPaid: o.amount, paymentStatus: 'Pending', isOfflineRequest: true, offlineStatus: o.status }))],
      emiPlans,
    )
    res.json({ success: true, data: dashboard })
  } catch (error) {
    next(error)
  }
}

export async function getPaymentReports(req, res, next) {
  try {
    const data = await loadPayments()
    res.json({ success: true, count: data.length, data })
  } catch (error) {
    next(error)
  }
}

export async function getPaymentReportById(req, res, next) {
  try {
    const payments = await loadPayments()
    const found = findPaymentById(payments, req.params.id)
    if (!found) {
      const doc = await Payment.findOne({
        $or: [{ paymentId: req.params.id }, { _id: req.params.id }],
      })
      if (!doc) return res.status(404).json({ success: false, message: 'Payment not found' })
      return res.json({ success: true, data: mapPayment(doc) })
    }
    res.json({ success: true, data: found })
  } catch (error) {
    next(error)
  }
}

export async function updatePaymentStatus(req, res, next) {
  try {
    const { id } = req.params
    const payload = req.body || {}
    let doc = await Payment.findOne({
      $or: [{ paymentId: id }, { _id: id }],
      isOfflineRequest: { $ne: true },
    })

    if (!doc) {
      const payments = await loadPayments()
      const seed = findPaymentById(payments, id)
      if (!seed) return res.status(404).json({ success: false, message: 'Payment not found' })
      const updated = {
        ...seed,
        paymentStatus: payload.newStatus || seed.paymentStatus,
        amountPaid:
          payload.amountAdjustment != null ? Number(payload.amountAdjustment) : seed.amountPaid,
        paymentMode: payload.paymentMode || seed.paymentMode,
        transactionId: payload.transactionId || seed.transactionId,
        paymentDate: payload.paymentDate || seed.paymentDate,
        adminLogs: [
          ...(seed.adminLogs || []),
          {
            adminName: payload.adminName || 'Admin',
            action: `Status → ${payload.newStatus}`,
            comment: payload.comment,
            timestamp: new Date().toISOString(),
          },
        ],
      }
      return res.json({ success: true, data: updated })
    }

    if (payload.newStatus) doc.paymentStatus = payload.newStatus
    if (payload.amountAdjustment != null) doc.amountPaid = Number(payload.amountAdjustment)
    if (payload.paymentMode) doc.paymentMode = payload.paymentMode
    if (payload.transactionId) doc.transactionId = payload.transactionId
    if (payload.paymentDate) doc.paymentDate = payload.paymentDate
    doc.adminLogs.push({
      adminName: payload.adminName || 'Admin',
      action: `Status → ${payload.newStatus || doc.paymentStatus}`,
      comment: payload.comment,
      timestamp: new Date(),
    })
    await doc.save()
    res.json({ success: true, data: mapPayment(doc) })
  } catch (error) {
    next(error)
  }
}

export async function getOfflineApprovals(req, res, next) {
  try {
    const data = await loadOffline()
    res.json({ success: true, count: data.length, data })
  } catch (error) {
    next(error)
  }
}

export async function approveOfflinePayment(req, res, next) {
  try {
    const { id } = req.params
    const { newStatus } = req.body || {}
    const status = newStatus === 'Approved' ? 'Approved' : 'Rejected'

    let doc = await Payment.findOne({
      $or: [{ paymentId: id }, { _id: id }],
      isOfflineRequest: true,
    })

    if (!doc) {
      const offline = await loadOffline()
      const found = offline.find((o) => o.id === id)
      if (!found) return res.status(404).json({ success: false, message: 'Request not found' })
      return res.json({ success: true, data: { ...found, status } })
    }

    doc.offlineStatus = status
    await doc.save()
    res.json({ success: true, data: mapOffline(doc) })
  } catch (error) {
    next(error)
  }
}

export async function getEmiPlans(req, res, next) {
  try {
    const data = await loadEmiPlans()
    res.json({ success: true, count: data.length, data })
  } catch (error) {
    next(error)
  }
}

export async function updateEmiPlan(req, res, next) {
  try {
    const { planId } = req.params
    const { installments } = req.body || {}

    let doc = await EmiPlan.findOne({
      $or: [{ planId }, { _id: planId }],
    })

    if (!doc) {
      const plans = await loadEmiPlans()
      const found = plans.find((p) => p.id === planId)
      if (!found) return res.status(404).json({ success: false, message: 'EMI plan not found' })
      return res.json({ success: true, data: { ...found, installments: installments || found.installments } })
    }

    if (installments) doc.installments = installments
    await doc.save()
    res.json({ success: true, data: mapEmi(doc) })
  } catch (error) {
    next(error)
  }
}

export async function getStudentFinanceProfiles(req, res, next) {
  try {
    const payments = await loadPayments()
    res.json({ success: true, data: buildProfiles(payments) })
  } catch (error) {
    next(error)
  }
}

export async function getPaymentAttemptLogs(req, res, next) {
  try {
    const payments = await loadPayments()
    res.json({ success: true, data: buildAttemptLogs(payments) })
  } catch (error) {
    next(error)
  }
}

export async function getCommunicationLogs(req, res, next) {
  try {
    const data = await loadCommLogs()
    res.json({ success: true, count: data.length, data })
  } catch (error) {
    next(error)
  }
}

export async function sendPaymentReminder(req, res, next) {
  try {
    const payload = req.body || {}
    const entry = await CommunicationLog.create({
      logId: `COM-${Date.now()}`,
      recipient: payload.mobile || payload.email,
      type: 'Payment Reminder',
      channel: payload.channel || 'WhatsApp',
      status: 'Queued',
      timestamp: new Date(),
      meta: payload,
    })
    res.status(201).json({ success: true, data: mapComm(entry) })
  } catch (error) {
    next(error)
  }
}

export async function getVerificationQueue(req, res, next) {
  try {
    const payments = await loadPayments()
    res.json({ success: true, data: buildVerificationQueue(payments) })
  } catch (error) {
    next(error)
  }
}

export async function getGstSettings(req, res, next) {
  try {
    const data = await loadGst()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export async function updateGstSettings(req, res, next) {
  try {
    const payload = req.body || {}
    let doc = await GstSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: payload, key: 'default' },
      { new: true, upsert: true },
    )
    res.json({ success: true, data: mapGst(doc) })
  } catch (error) {
    next(error)
  }
}

export async function generateReceipt(req, res, next) {
  try {
    const payments = await loadPayments()
    const found = findPaymentById(payments, req.params.paymentId)
    if (!found) return res.status(404).json({ success: false, message: 'Payment not found' })
    const receiptNumber =
      found.receiptNumber || `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    res.json({ success: true, data: { ...found, receiptNumber } })
  } catch (error) {
    next(error)
  }
}

export async function resendReceipt(req, res, next) {
  try {
    const { channel } = req.body || {}
    res.json({ success: true, data: { success: true, channel: channel || 'Email' } })
  } catch (error) {
    next(error)
  }
}
