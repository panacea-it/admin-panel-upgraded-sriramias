/** Dedicated verification queue demo data (independent of payment reports list) */

const now = new Date()
const daysAgo = (n) => {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/**
 * Active verification queue — excludes Approved (those live in Student Payment Reports only).
 * One demo row per status except Approved.
 */
export const INITIAL_VERIFICATION_QUEUE = [
  {
    id: 'PAY-C0-3',
    studentId: 'STU-C03',
    student: 'Student DLH-4',
    centerName: 'Delhi Center',
    centerId: 'ctr-delhi',
    course: 'CSAT Crash Course',
    courseId: 'CRS-104',
    batchName: 'Morning Batch 2026',
    amount: 70000,
    paymentMode: 'UPI',
    utrNumber: 'TXN-PAY-C0-3',
    paymentProof: 'upi-screenshot-pay-c0-3.png',
    verificationStatus: 'Pending Verification',
    submittedAt: daysAgo(2),
    verifiedBy: '—',
    remarks: '',
    auditTrail: [{ by: 'Student', action: 'Proof uploaded', at: daysAgo(2) }],
  },
  {
    id: 'PAY-C1-1',
    studentId: 'STU-C11',
    student: 'Student MUM-2',
    centerName: 'Mumbai Center',
    centerId: 'ctr-mumbai',
    course: 'GS Mains Comprehensive',
    courseId: 'CRS-102',
    batchName: 'Evening Batch 2026',
    amount: 60000,
    paymentMode: 'UPI',
    utrNumber: 'TXN-PAY-C1-1',
    paymentProof: 'bank-transfer-mum-2.jpg',
    verificationStatus: 'Pending Verification',
    submittedAt: daysAgo(1),
    verifiedBy: '—',
    remarks: 'Second pending sample for filter demo',
    auditTrail: [{ by: 'Student', action: 'Proof uploaded', at: daysAgo(1) }],
  },
  {
    id: 'VER-UR-001',
    studentId: 'STU-24020',
    student: 'Kavya Nair',
    centerName: 'Bangalore Center',
    centerId: 'ctr-bangalore',
    course: 'UPSC Prelims Foundation',
    courseId: 'CRS-101',
    batchName: 'Weekend Batch 2026',
    amount: 45000,
    paymentMode: 'Bank Transfer',
    utrNumber: 'UTR8829104455',
    paymentProof: 'neft-receipt-kavya.pdf',
    verificationStatus: 'Under Review',
    submittedAt: daysAgo(3),
    verifiedBy: 'Priya Accounts',
    remarks: 'Re-upload requested — checking clearer NEFT receipt',
    auditTrail: [
      { by: 'Student', action: 'Proof uploaded', at: daysAgo(4) },
      { by: 'Finance Admin', action: 'Re-upload requested', at: daysAgo(3) },
    ],
  },
  {
    id: 'VER-REJ-001',
    studentId: 'STU-24021',
    student: 'Imran Khan',
    centerName: 'Hyderabad Center',
    centerId: 'ctr-hyderabad',
    course: 'Optional Sociology',
    courseId: 'CRS-103',
    batchName: 'Morning Batch 2026',
    amount: 55000,
    paymentMode: 'UPI',
    utrNumber: 'UTR-INVALID-9912',
    paymentProof: 'blurry-upi-imran.png',
    verificationStatus: 'Rejected',
    submittedAt: daysAgo(5),
    verifiedBy: 'Verifier Admin',
    remarks: 'UTR not found in bank statement; amount mismatch',
    auditTrail: [
      { by: 'Student', action: 'Proof uploaded', at: daysAgo(6) },
      { by: 'Verifier Admin', action: 'Rejected', at: daysAgo(5) },
    ],
  },
  {
    id: 'VER-ESC-001',
    studentId: 'STU-24022',
    student: 'Divya Reddy',
    centerName: 'Chennai Center',
    centerId: 'ctr-chennai',
    course: 'GS Mains Comprehensive',
    courseId: 'CRS-102',
    batchName: 'Evening Batch 2026',
    amount: 125000,
    paymentMode: 'Cheque',
    utrNumber: 'CHQ-2026-44821',
    paymentProof: 'cheque-scan-divya.pdf',
    verificationStatus: 'Escalated',
    submittedAt: daysAgo(1),
    verifiedBy: '—',
    remarks: 'High-value cheque — escalated to senior finance for manual verification',
    auditTrail: [
      { by: 'Student', action: 'Proof uploaded', at: daysAgo(2) },
      { by: 'Center Finance', action: 'Escalated', at: daysAgo(1) },
    ],
  },
]

/** Students selectable in offline payment form */
export const VERIFICATION_STUDENT_OPTIONS = [
  { studentId: 'STU-24001', studentName: 'Aarav Sharma', centerName: 'Delhi Center' },
  { studentId: 'STU-24002', studentName: 'Neha Verma', centerName: 'Mumbai Center' },
  { studentId: 'STU-C03', studentName: 'Student DLH-4', centerName: 'Delhi Center' },
  { studentId: 'STU-C11', studentName: 'Student MUM-2', centerName: 'Mumbai Center' },
  { studentId: 'STU-24020', studentName: 'Kavya Nair', centerName: 'Bangalore Center' },
  { studentId: 'STU-24030', studentName: 'Rohan Iyer', centerName: 'Delhi Center' },
  { studentId: 'STU-24031', studentName: 'Meera Joshi', centerName: 'Mumbai Center' },
]
