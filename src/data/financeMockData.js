/** In-memory mock store for finance APIs when backend is unavailable */

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
]

export const MOCK_OFFLINE_REQUESTS = [
  {
    id: 'OFF-001',
    studentName: 'Vikram Singh',
    studentId: 'STU-24010',
    course: 'GS Mains Comprehensive',
    courseId: 'CRS-102',
    amount: 20000,
    status: 'Pending',
    requestedDate: daysAgo(2),
    paymentProof: 'cash-slip-001.jpg',
    paymentMode: 'Cash',
  },
  {
    id: 'OFF-002',
    studentName: 'Anita Das',
    studentId: 'STU-24011',
    course: 'UPSC Prelims Foundation',
    courseId: 'CRS-101',
    amount: 15000,
    status: 'Pending',
    requestedDate: daysAgo(1),
    paymentProof: 'upi-screenshot.png',
    paymentMode: 'UPI Offline',
  },
]

export const MOCK_EMI_PLANS = [
  {
    id: 'EMI-001',
    studentId: 'STU-24002',
    studentName: 'Neha Verma',
    courseId: 'CRS-102',
    courseName: 'GS Mains Comprehensive',
    totalFees: 75000,
    totalPaid: 30000,
    pendingAmount: 45000,
    completionPercent: 40,
    installments: [
      { emiNo: 1, emiDate: '2026-01-10', emiAmount: 15000, status: 'Paid', dueDate: '2026-01-10', paidDate: '2026-01-10', paymentMode: 'UPI', receipt: 'RCP-E1' },
      { emiNo: 2, emiDate: '2026-02-10', emiAmount: 15000, status: 'Paid', dueDate: '2026-02-10', paidDate: '2026-02-12', paymentMode: 'Bank Transfer', receipt: 'RCP-E2' },
      { emiNo: 3, emiDate: '2026-03-10', emiAmount: 15000, status: 'Due', dueDate: '2026-03-10', paidDate: '', paymentMode: '', receipt: null },
      { emiNo: 4, emiDate: '2026-04-10', emiAmount: 15000, status: 'Due', dueDate: '2026-04-10', paidDate: '', paymentMode: '', receipt: null },
      { emiNo: 5, emiDate: '2026-05-10', emiAmount: 15000, status: 'Due', dueDate: '2026-05-10', paidDate: '', paymentMode: '', receipt: null },
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
  branchGst: FINANCE_BRANCHES.map((b) => ({ branchId: b.id, branchName: b.name, gstEnabled: true, gstNumber: `29ABCDE${b.id.slice(-3)}F1Z5` })),
}

export const MOCK_DASHBOARD = {
  stats: {
    totalPayments: 1248,
    totalRevenue: 42500000,
    pendingPayments: 86,
    failedPayments: 42,
    emiActiveStudents: 312,
    offlineApprovalsPending: 14,
    todayCollections: 485000,
    monthlyCollections: 8750000,
  },
  monthlyRevenue: [
    { month: 'Jan', amount: 6200000 },
    { month: 'Feb', amount: 7100000 },
    { month: 'Mar', amount: 6800000 },
    { month: 'Apr', amount: 8200000 },
    { month: 'May', amount: 8750000 },
  ],
  paymentStatusBreakdown: [
    { label: 'Paid', value: 72, color: '#69df66' },
    { label: 'Partial', value: 14, color: '#efb36d' },
    { label: 'Pending', value: 9, color: '#55ace7' },
    { label: 'Failed', value: 5, color: '#df8284' },
  ],
  courseWiseRevenue: FINANCE_COURSES.map((c, i) => ({
    course: c.name,
    amount: [12000000, 9800000, 7500000, 5200000][i],
  })),
  emiTrend: [
    { month: 'Jan', collected: 2100000 },
    { month: 'Feb', collected: 2450000 },
    { month: 'Mar', collected: 2300000 },
    { month: 'Apr', collected: 2680000 },
    { month: 'May', collected: 2890000 },
  ],
  recentPayments: MOCK_PAYMENT_REPORTS.filter((p) => p.amountPaid > 0).slice(0, 5),
  recentFailed: MOCK_PAYMENT_REPORTS.filter((p) => p.paymentStatus === 'Pending').slice(0, 3),
  pendingEmiDues: MOCK_EMI_PLANS[0].installments.filter((e) => e.status === 'Due' || e.status === 'Overdue'),
}

export const MOCK_VERIFICATION_QUEUE = MOCK_PAYMENT_REPORTS.filter(
  (p) => p.paymentStatus === 'Pending' || p.paymentStatus === 'Partial',
).map((p) => ({
  id: p.id,
  student: p.studentName,
  course: p.courseName,
  amount: p.pendingAmount || p.totalFees,
  status: p.paymentStatus,
  submittedAt: p.paymentDate || daysAgo(1),
}))
