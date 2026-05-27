/** Finance Operations — shared constants (ERP workflows) */

export const FINANCE_PAYMENT_STATUSES = [
  'Paid',
  'Partially Paid',
  'Pending',
  'Overdue',
  'Failed',
  'Verification Pending',
  'Verified',
  'Rejected',
  'Refunded',
  'EMI Running',
  'EMI Completed',
]

export const FINANCE_VERIFICATION_STATUSES = [
  'Pending Verification',
  'Under Review',
  'Approved',
  'Rejected',
  'Escalated',
]

export const FINANCE_OFFLINE_STATUSES = ['Uploaded', 'Pending Approval', 'Approved', 'Rejected']

export const FINANCE_EMI_STATUSES = ['EMI Running', 'EMI Completed', 'Overdue', 'Due']

export const FINANCE_PAYMENT_MODES = ['UPI', 'Card', 'Bank Transfer', 'Cash', 'UPI Offline', 'Cheque']

export const FINANCE_COMMUNICATION_CHANNELS = ['Email', 'WhatsApp', 'SMS']

export const FINANCE_BATCHES = [
  { id: 'batch-morning', name: 'Morning Batch 2026' },
  { id: 'batch-evening', name: 'Evening Batch 2026' },
  { id: 'batch-weekend', name: 'Weekend Batch 2026' },
]

export const FINANCE_STATES = [
  { code: 'DL', name: 'Delhi' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
]

/** Standard export columns for all finance tables */
export const FINANCE_STANDARD_EXPORT_COLUMNS = [
  { key: 'studentId', label: 'Student ID' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'centerName', label: 'Center' },
  { key: 'branch', label: 'Branch' },
  { key: 'state', label: 'State' },
  { key: 'courseName', label: 'Course' },
  { key: 'batchName', label: 'Batch' },
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'paymentStatus', label: 'Payment Status' },
  { key: 'verificationStatus', label: 'Verification Status' },
  { key: 'emiStatus', label: 'EMI Status' },
  { key: 'receiptNumber', label: 'Receipt Number' },
  { key: 'invoiceNumber', label: 'Invoice Number' },
  { key: 'gstAmount', label: 'GST Amount' },
  { key: 'totalFees', label: 'Total Fees' },
  { key: 'amountPaid', label: 'Collected Amount' },
  { key: 'pendingAmount', label: 'Pending Amount' },
  { key: 'overdueAmount', label: 'Overdue Amount' },
  { key: 'transactionId', label: 'Transaction ID' },
  { key: 'utrNumber', label: 'UTR Number' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'updatedBy', label: 'Updated By' },
  { key: 'approvedBy', label: 'Approved By' },
  { key: 'paymentDate', label: 'Payment Date & Time' },
]

/** Role mapping for finance ERP (uses existing admin roles) */
export const FINANCE_ROLE_MAP = {
  super_admin: 'Super Admin',
  operation_admin: 'Finance Admin',
  center_admin: 'Center Finance Manager',
  counseling_admin: 'Accountant (View)',
}
