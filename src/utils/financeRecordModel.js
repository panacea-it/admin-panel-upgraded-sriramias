import { FINANCE_BATCHES, FINANCE_STATES } from '../constants/financeConstants'
import { branchToCenterName } from './financeCenterAggregation'

const batchName = (id) => FINANCE_BATCHES.find((b) => b.id === id)?.name || '—'

export function normalizePaymentStatus(status, row = {}) {
  if (status === 'Partial') return 'Partially Paid'
  if (status === 'Paid' && row.paymentType === 'EMI' && (row.pendingAmount || 0) > 0) return 'EMI Running'
  if (status === 'Paid' && row.paymentType === 'EMI' && !(row.pendingAmount || 0)) return 'EMI Completed'
  return status
}

export function deriveVerificationStatus(row) {
  if (row.verificationStatus) return row.verificationStatus
  if (row.paymentStatus === 'Pending' || row.paymentStatus === 'Partially Paid') return 'Pending Verification'
  if (row.paymentStatus === 'Paid' || row.paymentStatus === 'Verified') return 'Verified'
  if (row.paymentStatus === 'Failed' || row.paymentStatus === 'Rejected') return 'Rejected'
  return 'Under Review'
}

export function deriveEmiStatus(row) {
  if (row.emiStatus) return row.emiStatus
  if (row.paymentType !== 'EMI') return '—'
  if (row.paymentStatus === 'Paid' && !(row.pendingAmount || 0)) return 'EMI Completed'
  if ((row.pendingAmount || 0) > 0) return 'EMI Running'
  return 'EMI Running'
}

export function enrichFinanceRecord(row) {
  const centerName = row.centerName || branchToCenterName(row.branch)
  const batchId = row.batchId || 'batch-morning'
  const state = row.state || FINANCE_STATES.find((s) => centerName?.includes('Delhi'))?.name || 'Delhi'

  return {
    ...row,
    centerName,
    batchId,
    batchName: row.batchName || batchName(batchId),
    state,
    paymentStatus: normalizePaymentStatus(row.paymentStatus, row),
    verificationStatus: deriveVerificationStatus(row),
    emiStatus: deriveEmiStatus(row),
    gstAmount: row.gst ?? row.gstAmount ?? 0,
    invoiceNumber: row.invoiceNumber || (row.receiptNumber ? row.receiptNumber.replace('RCP', 'INV') : ''),
    overdueAmount: row.overdueAmount ?? (row.paymentStatus === 'Overdue' ? row.pendingAmount : 0),
    utrNumber: row.utrNumber || row.transactionId || '',
    createdBy: row.createdBy || row.adminLogs?.[0]?.adminName || 'System',
    updatedBy: row.updatedBy || row.adminLogs?.slice(-1)[0]?.adminName || '—',
    approvedBy: row.approvedBy || row.adminLogs?.find((l) => l.action?.includes('Approved'))?.adminName || '—',
  }
}

export function enrichFinanceRows(rows) {
  return (rows || []).map(enrichFinanceRecord)
}
