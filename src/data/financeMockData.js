/** In-memory mock store for finance APIs when backend is unavailable */

import {
  aggregateFinanceDashboard,
  branchToCenterName,
  buildCenterRanking,
  buildCenterSummaries,
  buildCompareSeries,
  buildPerformanceHighlights,
} from '../utils/financeCenterAggregation'

const CENTER_SEED = [
  { centerId: 'ctr-delhi', centerName: 'Delhi Center', centerCode: 'DLH', linkedStudentCount: 420 },
  { centerId: 'ctr-mumbai', centerName: 'Mumbai Center', centerCode: 'MUM', linkedStudentCount: 380 },
  { centerId: 'ctr-bangalore', centerName: 'Bangalore Center', centerCode: 'BLR', linkedStudentCount: 310 },
  { centerId: 'ctr-chennai', centerName: 'Chennai Center', centerCode: 'CHE', linkedStudentCount: 220 },
  { centerId: 'ctr-hyderabad', centerName: 'Hyderabad Center', centerCode: 'HYD', linkedStudentCount: 290 },
]

export const FINANCE_COURSES = [
  { id: 'CRS-101', name: 'UPSC Prelims Foundation', type: 'Online' },
  { id: 'CRS-102', name: 'GS Mains Comprehensive', type: 'Offline' },
  { id: 'CRS-103', name: 'Optional Sociology', type: 'Hybrid' },
  { id: 'CRS-104', name: 'CSAT Crash Course', type: 'Online' },
]

export const FINANCE_BRANCHES = [
  { id: 'BR-DEL', name: 'Delhi HQ' },
  { id: 'BR-LKO', name: 'Lucknow' },
  { id: 'BR-PAT', name: 'Patna' },
]

const now = new Date()
const iso = (d) => d.toISOString()
const daysAgo = (n) => {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return iso(d)
}

function buildAttempts(baseId, successIdx = 2) {
  return [
    {
      attemptNo: 1,
      transactionId: `TXN-${baseId}-A1`,
      gatewayResponse: 'FAILED',
      status: 'Failed',
      dateTime: daysAgo(12),
      failureReason: 'Insufficient funds',
      paymentMode: 'UPI',
    },
    {
      attemptNo: 2,
      transactionId: `TXN-${baseId}-A2`,
      gatewayResponse: 'FAILED',
      status: 'Failed',
      dateTime: daysAgo(10),
      failureReason: 'Gateway timeout',
      paymentMode: 'Card',
    },
    {
      attemptNo: 3,
      transactionId: `TXN-${baseId}-A3`,
      gatewayResponse: 'SUCCESS',
      status: 'Success',
      dateTime: daysAgo(8),
      failureReason: '',
      paymentMode: 'UPI',
    },
  ].map((a, i) => (i === successIdx ? { ...a, status: 'Success', gatewayResponse: 'SUCCESS' } : a))
}

export const MOCK_PAYMENT_REPORTS = [
  {
    id: 'PAY-001',
    studentId: 'STU-24001',
    studentName: 'Aarav Sharma',
    mobile: '9876543210',
    email: 'aarav@example.com',
    courseId: 'CRS-101',
    courseName: 'UPSC Prelims Foundation',
    courseType: 'Online',
    paymentStatus: 'Paid',
    paymentType: 'Full',
    paymentMode: 'UPI',
    amountPaid: 45000,
    pendingAmount: 0,
    totalFees: 45000,
    gst: 8100,
    transactionId: 'TXN-PAY-001-A3',
    paymentDate: daysAgo(8),
    branch: 'Delhi HQ',
    attempts: buildAttempts('PAY-001'),
    adminLogs: [
      { adminName: 'Priya Accounts', action: 'Status verified', comment: 'UPI receipt matched', timestamp: daysAgo(7) },
    ],
    timeline: [
      { event: 'Payment Initiated', timestamp: daysAgo(12) },
      { event: 'Failed', timestamp: daysAgo(12) },
      { event: 'Retried', timestamp: daysAgo(10) },
      { event: 'Successful', timestamp: daysAgo(8) },
      { event: 'Receipt Generated', timestamp: daysAgo(8) },
    ],
    receiptNumber: 'RCP-2026-0001',
  },
  {
    id: 'PAY-002',
    studentId: 'STU-24002',
    studentName: 'Neha Verma',
    mobile: '9123456780',
    email: 'neha@example.com',
    courseId: 'CRS-102',
    courseName: 'GS Mains Comprehensive',
    courseType: 'Offline',
    paymentStatus: 'Partial',
    paymentType: 'EMI',
    paymentMode: 'Bank Transfer',
    amountPaid: 30000,
    pendingAmount: 45000,
    totalFees: 75000,
    gst: 13500,
    transactionId: 'TXN-PAY-002-A1',
    paymentDate: daysAgo(5),
    branch: 'Lucknow',
    attempts: buildAttempts('PAY-002', 0),
    adminLogs: [],
    timeline: [
      { event: 'Payment Initiated', timestamp: daysAgo(5) },
      { event: 'Successful', timestamp: daysAgo(5) },
    ],
    receiptNumber: 'RCP-2026-0002',
  },
  {
    id: 'PAY-003',
    studentId: 'STU-24003',
    studentName: 'Rahul Mehta',
    mobile: '9988776655',
    email: 'rahul@example.com',
    courseId: 'CRS-103',
    courseName: 'Optional Sociology',
    courseType: 'Hybrid',
    paymentStatus: 'Pending',
    paymentType: 'Full',
    paymentMode: 'Card',
    amountPaid: 0,
    pendingAmount: 55000,
    totalFees: 55000,
    gst: 9900,
    transactionId: '',
    paymentDate: '',
    branch: 'Patna',
    attempts: buildAttempts('PAY-003', -1).map((a) => ({ ...a, status: 'Failed' })),
    adminLogs: [],
    timeline: [{ event: 'Payment Initiated', timestamp: daysAgo(2) }, { event: 'Failed', timestamp: daysAgo(2) }],
    receiptNumber: null,
  },
  {
    id: 'PAY-004',
    studentId: 'STU-24004',
    studentName: 'Sneha Kapoor',
    mobile: '9012345678',
    email: 'sneha@example.com',
    courseId: 'CRS-104',
    courseName: 'CSAT Crash Course',
    courseType: 'Online',
    paymentStatus: 'Paid',
    paymentType: 'Full',
    paymentMode: 'Cash',
    amountPaid: 25000,
    pendingAmount: 0,
    totalFees: 25000,
    gst: 4500,
    transactionId: 'OFFLINE-004',
    paymentDate: daysAgo(1),
    branch: 'Delhi HQ',
    attempts: [],
    adminLogs: [
      { adminName: 'Admin User', action: 'Manual Approved', comment: 'Cash received at counter', timestamp: daysAgo(1) },
    ],
    timeline: [
      { event: 'Payment Initiated', timestamp: daysAgo(3) },
      { event: 'Manual Approved', timestamp: daysAgo(1) },
      { event: 'Receipt Generated', timestamp: daysAgo(1) },
    ],
    receiptNumber: 'RCP-2026-0004',
  },
  {
    id: 'PAY-005',
    studentId: 'STU-24005',
    studentName: 'Karan Joshi',
    mobile: '9898989898',
    email: 'karan@example.com',
    courseId: 'CRS-102',
    courseName: 'GS Mains Comprehensive',
    courseType: 'Offline',
    paymentStatus: 'Paid',
    paymentType: 'EMI',
    paymentMode: 'UPI',
    amountPaid: 75000,
    pendingAmount: 0,
    totalFees: 75000,
    gst: 13500,
    emiStatus: 'EMI Completed',
    emiCompletionNote: 'All 5 EMI installments collected. Plan closed successfully.',
    transactionId: 'TXN-PAY-005-FINAL',
    paymentDate: daysAgo(3),
    branch: 'Delhi HQ',
    attempts: [],
    adminLogs: [
      { adminName: 'Finance Admin', action: 'EMI Completed', comment: 'Final installment verified', timestamp: daysAgo(3) },
    ],
    timeline: [
      { event: 'EMI Plan Active', timestamp: daysAgo(120) },
      { event: 'Final Installment Paid', timestamp: daysAgo(3) },
      { event: 'Receipt Generated', timestamp: daysAgo(3) },
    ],
    receiptNumber: 'RCP-2026-0005',
    receiptGeneratedBy: 'Finance Admin',
    receiptGeneratedAt: daysAgo(3),
    receiptCommunications: {
      whatsapp: { status: 'Delivered', sentAt: daysAgo(2), sentBy: 'Finance Admin' },
      sms: { status: 'Not Sent', sentAt: null, sentBy: null },
      email: { status: 'Delivered', sentAt: daysAgo(2), sentBy: 'Finance Admin' },
    },
  },
]

export const MOCK_OFFLINE_REQUESTS = [
  {
    id: 'OFF-001',
    studentName: 'Vikram Singh',
    studentId: 'STU-24010',
    centerName: 'Delhi Center',
    course: 'GS Mains Comprehensive',
    courseId: 'CRS-102',
    amount: 20000,
    status: 'Pending Approval',
    requestedDate: daysAgo(2),
    paymentProof: 'cash-slip-001.jpg',
    paymentMode: 'Cash',
    utrNumber: '',
    verificationNotes: 'Cash deposit at counter',
    auditTrail: [{ by: 'Student', action: 'Uploaded', at: daysAgo(2) }],
  },
  {
    id: 'OFF-002',
    studentName: 'Anita Das',
    studentId: 'STU-24011',
    centerName: 'Mumbai Center',
    course: 'UPSC Prelims Foundation',
    courseId: 'CRS-101',
    amount: 15000,
    status: 'Pending Approval',
    requestedDate: daysAgo(1),
    paymentProof: 'upi-screenshot.png',
    paymentMode: 'UPI Offline',
    utrNumber: 'UTR8829103344',
    verificationNotes: '',
    auditTrail: [{ by: 'Student', action: 'Uploaded', at: daysAgo(1) }],
  },
]

export const MOCK_EMI_PLANS = [
  {
    id: 'EMI-001',
    studentId: 'STU-24002',
    studentName: 'Neha Verma',
    mobile: '9876543212',
    email: 'neha.verma@example.com',
    courseId: 'CRS-102',
    courseName: 'GS Mains Comprehensive',
    totalFees: 75000,
    totalPaid: 30000,
    pendingAmount: 45000,
    completionPercent: 40,
    emiStartDate: '2026-01-10',
    emiEndDate: '2026-05-10',
    emiDurationMonths: 5,
    planStatus: 'EMI Running',
    overdueAmount: 0,
    planHistory: [
      { action: 'EMI plan activated', by: 'Finance Admin', at: daysAgo(90) },
    ],
    installments: [
      {
        emiNo: 1,
        installmentNo: 1,
        emiMonth: 'Jan 2026',
        emiDate: '2026-01-10',
        dueDate: '2026-01-10',
        emiAmount: 15000,
        paidAmount: 15000,
        status: 'Paid',
        paidDate: '2026-01-10',
        paymentMode: 'UPI',
        utrNumber: 'UPI9988776611',
        receiptNumber: 'RCP-E1',
        proofFileName: 'upi-screenshot-jan.jpg',
        collectedBy: 'Center Finance',
        remarks: 'First EMI collected at counter',
        paymentHistory: [{ action: 'Paid via UPI', at: daysAgo(60), by: 'Finance Admin' }],
      },
      {
        emiNo: 2,
        installmentNo: 2,
        emiMonth: 'Feb 2026',
        emiDate: '2026-02-10',
        dueDate: '2026-02-10',
        emiAmount: 15000,
        paidAmount: 15000,
        status: 'Paid',
        paidDate: '2026-02-12',
        paymentMode: 'Bank Transfer',
        utrNumber: 'NEFT2233445566',
        receiptNumber: 'RCP-E2',
        proofFileName: 'bank-slip-feb.pdf',
        collectedBy: 'Finance Admin',
        paymentHistory: [{ action: 'Bank transfer verified', at: daysAgo(30), by: 'Finance Admin' }],
      },
      {
        emiNo: 3,
        installmentNo: 3,
        emiMonth: 'Mar 2026',
        emiDate: '2026-03-10',
        dueDate: '2026-03-10',
        emiAmount: 15000,
        paidAmount: 0,
        status: 'Due',
        paidDate: '',
        paymentMode: '',
        receiptNumber: '',
        paymentHistory: [],
      },
      {
        emiNo: 4,
        installmentNo: 4,
        emiMonth: 'Apr 2026',
        emiDate: '2026-04-10',
        dueDate: '2026-04-10',
        emiAmount: 15000,
        paidAmount: 0,
        status: 'Due',
        paidDate: '',
        paymentMode: '',
        receiptNumber: '',
        paymentHistory: [],
      },
      {
        emiNo: 5,
        installmentNo: 5,
        emiMonth: 'May 2026',
        emiDate: '2026-05-10',
        dueDate: '2026-05-10',
        emiAmount: 15000,
        paidAmount: 0,
        status: 'Due',
        paidDate: '',
        paymentMode: '',
        receiptNumber: '',
        paymentHistory: [],
      },
    ],
  },
]

export const MOCK_STUDENT_PROFILES = MOCK_PAYMENT_REPORTS.map((p) => ({
  id: p.studentId,
  studentName: p.studentName,
  mobile: p.mobile,
  email: p.email,
  branch: p.branch,
  totalPaid: p.amountPaid,
  totalPending: p.pendingAmount,
  courses: [
    {
      courseId: p.courseId,
      courseName: p.courseName,
      courseType: p.courseType,
      paymentStatus: p.paymentStatus === 'Paid' ? 'Active' : p.paymentStatus === 'Partial' ? 'Pending Payment' : 'Pending Payment',
      date: p.paymentDate || daysAgo(30),
      paymentType: p.paymentType,
      paidAmount: p.amountPaid,
      pendingAmount: p.pendingAmount,
    },
  ],
}))

export const MOCK_ATTEMPT_LOGS = MOCK_PAYMENT_REPORTS.flatMap((p) =>
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
    retryCount: a.attemptNo - 1,
    paymentMode: a.paymentMode,
    status: a.status,
  })),
)

export const MOCK_COMMUNICATION_LOGS = [
  { id: 'COM-001', recipient: 'aarav@example.com', type: 'Payment Receipt', channel: 'Email', status: 'Delivered', timestamp: daysAgo(8) },
  { id: 'COM-002', recipient: '9876543210', type: 'Admission Confirmation', channel: 'WhatsApp', status: 'Delivered', timestamp: daysAgo(8) },
  { id: 'COM-003', recipient: 'accounts@sriramias.com', type: 'Payment Alert', channel: 'Email', status: 'Delivered', timestamp: daysAgo(5) },
  { id: 'COM-004', recipient: 'rahul@example.com', type: 'Failed Payment Alert', channel: 'WhatsApp', status: 'Failed', timestamp: daysAgo(2) },
]

export const MOCK_GST_SETTINGS = {
  gstPercent: 18,
  invoicePrefix: 'INV-SRI-',
  receiptPrefix: 'RCP-SRI-',
  taxEnabled: true,
  branchGst: CENTER_SEED.map((c) => ({
    centerId: c.centerId,
    centerName: c.centerName,
    branchId: c.centerCode,
    branchName: c.centerName,
    gstEnabled: true,
    gstNumber: `29ABCDE${c.centerCode}F1Z5`,
    stateCode: '29',
    invoicePrefix: `INV-${c.centerCode}-`,
    receiptPrefix: `RCP-${c.centerCode}-`,
    financeManager: 'Center Finance Lead',
    address: `${c.centerName}, India`,
    logoUrl: '',
    signatureUrl: '',
    footerText: 'Thank you for your payment.',
  })),
}

function enrichPayment(p) {
  const centerName = p.centerName || branchToCenterName(p.branch)
  const center = CENTER_SEED.find((c) => c.centerName === centerName) || CENTER_SEED[0]
  return {
    ...p,
    centerId: p.centerId || center.centerId,
    centerName,
    counselorId: p.counselorId || 'c1',
    batchId: p.batchId || 'batch-morning',
  }
}

/** Extra payments so every center has visible analytics */
function generateCenterPayments() {
  const statuses = ['Paid', 'Paid', 'Partial', 'Pending', 'Failed']
  const extra = []
  CENTER_SEED.forEach((center, ci) => {
    FINANCE_COURSES.forEach((course, i) => {
      const id = `PAY-C${ci}-${i}`
      extra.push(
        enrichPayment({
          id,
          studentId: `STU-C${ci}${i}`,
          studentName: `Student ${center.centerCode}-${i + 1}`,
          mobile: `98${String(10000000 + ci * 100 + i).slice(-8)}`,
          email: `s${ci}${i}@example.com`,
          courseId: course.id,
          courseName: course.name,
          courseType: course.type,
          paymentStatus: statuses[(ci + i) % statuses.length],
          paymentType: i % 2 === 0 ? 'Full' : 'EMI',
          paymentMode: 'UPI',
          amountPaid: statuses[(ci + i) % statuses.length] === 'Paid' ? 40000 + ci * 8000 + i * 3000 : i % 3 === 0 ? 15000 : 0,
          pendingAmount: 0,
          totalFees: 55000 + i * 5000,
          gst: 9900,
          transactionId: `TXN-${id}`,
          paymentDate: daysAgo(3 + ci + i),
          branch: center.centerName,
          centerName: center.centerName,
          centerId: center.centerId,
          attempts: buildAttempts(id),
          adminLogs: [],
          timeline: [{ event: 'Payment Initiated', timestamp: daysAgo(5 + i) }],
          receiptNumber: `RCP-${id}`,
        }),
      )
    })
  })
  return extra
}

export const MOCK_PAYMENTS_ENRICHED = [
  ...MOCK_PAYMENT_REPORTS.map(enrichPayment),
  ...generateCenterPayments(),
]

function resolveCentersList(centerNames) {
  if (!centerNames?.length) return CENTER_SEED
  const names = String(centerNames).split(',').map((n) => n.trim()).filter(Boolean)
  return CENTER_SEED.filter((c) => names.includes(c.centerName))
}

function filterPaymentsForParams(payments, params) {
  let list = [...payments]
  if (params.course && params.course !== 'all') {
    list = list.filter((p) => p.courseId === params.course)
  }
  const scope = params.scope || 'overall'
  if (scope === 'overall') return list

  const centerNames = params.centerNames
    ? String(params.centerNames).split(',').map((n) => n.trim()).filter(Boolean)
    : []
  if (centerNames.length) {
    const nameSet = new Set(centerNames)
    list = list.filter((p) => nameSet.has(p.centerName))
  }
  return list
}

export function buildFinanceDashboardPayload(params = {}) {
  const scope = params.scope || 'overall'
  const payments = filterPaymentsForParams(MOCK_PAYMENTS_ENRICHED, params)
  const allSummaries = buildCenterSummaries(CENTER_SEED, MOCK_PAYMENTS_ENRICHED)
  const dashboard = aggregateFinanceDashboard(payments, MOCK_EMI_PLANS, 14)
  const paidCount = payments.filter((p) => p.paymentStatus === 'Paid').length
  const successRate = payments.length ? Math.round((paidCount / payments.length) * 100) : 0

  const base = {
    ...dashboard,
    stats: {
      ...dashboard.stats,
      paymentSuccessRate: successRate,
    },
    centerSummaries: allSummaries,
    centerRanking: buildCenterRanking(allSummaries),
    performance: buildPerformanceHighlights(allSummaries),
  }

  if (scope === 'compare') {
    const selected = resolveCentersList(params.centerNames)
    const selectedSummaries = allSummaries.filter((s) =>
      selected.some((c) => c.centerName === s.centerName),
    )
    return {
      viewMode: 'compare',
      ...base,
      centers: selectedSummaries,
      comparison: {
        revenue: buildCompareSeries(selectedSummaries, 'totalRevenue'),
        conversion: buildCompareSeries(selectedSummaries, 'conversionPct'),
        pending: buildCompareSeries(selectedSummaries, 'pendingPayments'),
        failed: buildCompareSeries(selectedSummaries, 'failedPayments'),
      },
    }
  }

  if (scope === 'center' || scope === 'multi') {
    const centerNames = params.centerNames ? String(params.centerNames).split(',').filter(Boolean) : []
    const primaryName = centerNames[0]
    return {
      viewMode: scope,
      centerName: primaryName,
      centerNames,
      ...base,
      centerRanking: buildCenterRanking(
        allSummaries.filter((s) => !centerNames.length || centerNames.includes(s.centerName)),
      ),
    }
  }

  return {
    viewMode: 'overall',
    ...base,
    stats: {
      ...base.stats,
      totalPayments: 1248,
      totalRevenue: 42500000,
      pendingPayments: 86,
      failedPayments: 42,
      emiActiveStudents: 312,
      offlineApprovalsPending: 14,
      todayCollections: 485000,
      monthlyCollections: 8750000,
      paymentSuccessRate: 94,
    },
  }
}

export const MOCK_DASHBOARD = buildFinanceDashboardPayload({ scope: 'overall' })

export function buildVerificationQueue(payments = MOCK_PAYMENTS_ENRICHED) {
  return payments
    .filter((p) => ['Pending', 'Partial', 'Partially Paid', 'Verification Pending'].includes(p.paymentStatus))
    .map((p) => ({
      id: p.id,
      studentId: p.studentId,
      student: p.studentName,
      centerName: p.centerName,
      course: p.courseName,
      batchName: p.batchName,
      amount: p.pendingAmount || p.totalFees,
      paymentMode: p.paymentMode,
      status: 'Pending Verification',
      verificationStatus: 'Pending Verification',
      submittedAt: p.paymentDate || daysAgo(1),
      utrNumber: p.utrNumber || p.transactionId || '',
      paymentProof: p.paymentProof || 'proof-upload.jpg',
      verifiedBy: '—',
      remarks: '',
      auditTrail: p.adminLogs || [],
    }))
}

export const MOCK_VERIFICATION_QUEUE = buildVerificationQueue()
