/** Payment Verification Center — status metadata & export */

export const FINANCE_VERIFICATION_STATUS_META = {
  'Pending Verification': {
    description: 'Payment submitted but not checked yet',
    sample: 'Student uploaded UPI screenshot; awaiting finance review',
  },
  'Under Review': {
    description: 'Finance or admin is currently reviewing proof',
    sample: 'Proof re-uploaded; verifier checking amount and UTR match',
  },
  Approved: {
    description: 'Payment verified successfully (moves to Student Payment Reports)',
    sample: 'Approved payments no longer appear in this queue',
  },
  Rejected: {
    description: 'Invalid proof or payment mismatch',
    sample: 'UTR does not match bank statement or amount differs',
  },
  Escalated: {
    description: 'Sent to senior finance or admin for manual verification',
    sample: 'High-value offline transfer flagged for manager sign-off',
  },
}

export const VERIFICATION_QUEUE_EXPORT_COLUMNS = [
  { key: 'id', label: 'Payment ID' },
  { key: 'student', label: 'Student' },
  { key: 'centerName', label: 'Center' },
  { key: 'course', label: 'Course' },
  { key: 'paymentMode', label: 'Mode' },
  {
    key: 'amount',
    label: 'Amount',
    export: (row) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
        row.amount ?? 0,
      ),
  },
  { key: 'utrNumber', label: 'UTR' },
  { key: 'verificationStatus', label: 'Status' },
  {
    key: 'submittedAt',
    label: 'Date',
    export: (row) => {
      if (!row.submittedAt) return ''
      const d = new Date(row.submittedAt)
      if (Number.isNaN(d.getTime())) return ''
      const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      return `${time}, ${date}`
    },
  },
  { key: 'remarks', label: 'Verification Remarks' },
]
