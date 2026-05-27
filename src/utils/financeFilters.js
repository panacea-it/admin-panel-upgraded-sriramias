import { enrichFinanceRecord } from './financeRecordModel'

export function filterPaymentReports(rows, filters = {}) {
  if (!Array.isArray(rows)) return []
  return rows.filter((row) => {
    if (!row) return false
    const r = enrichFinanceRecord(row)
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      const status = r.paymentStatus
      if (filters.paymentStatus === 'Partial' && status !== 'Partially Paid' && status !== 'Partial') return false
      if (filters.paymentStatus !== 'Partial' && status !== filters.paymentStatus) return false
    }
    if (filters.verificationStatus && filters.verificationStatus !== 'all' && r.verificationStatus !== filters.verificationStatus) {
      return false
    }
    if (filters.emiStatus && filters.emiStatus !== 'all' && r.emiStatus !== filters.emiStatus) {
      return false
    }
    if (filters.centerName && filters.centerName !== 'all' && r.centerName !== filters.centerName) {
      return false
    }
    if (filters.batchId && filters.batchId !== 'all' && r.batchId !== filters.batchId) {
      return false
    }
    if (filters.state && filters.state !== 'all' && r.state !== filters.state) {
      return false
    }
    if (filters.paymentType && filters.paymentType !== 'all' && row.paymentType !== filters.paymentType) {
      return false
    }
    if (filters.paymentMode && filters.paymentMode !== 'all' && row.paymentMode !== filters.paymentMode) {
      return false
    }
    if (filters.courseType && filters.courseType !== 'all' && row.courseType !== filters.courseType) {
      return false
    }
    if (filters.courseId && filters.courseId !== 'all' && row.courseId !== filters.courseId) {
      return false
    }
    if (filters.branch && filters.branch !== 'all' && r.branch !== filters.branch) {
      return false
    }
    if (filters.studentId?.trim() && !row.studentId.toLowerCase().includes(filters.studentId.trim().toLowerCase())) {
      return false
    }
    if (filters.studentName?.trim() && !row.studentName.toLowerCase().includes(filters.studentName.trim().toLowerCase())) {
      return false
    }
    if (filters.mobile?.trim() && !row.mobile.includes(filters.mobile.trim())) {
      return false
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase()
      const hay = `${row.studentName} ${row.studentId} ${row.courseName} ${row.transactionId}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters.dateFrom && row.paymentDate) {
      if (new Date(row.paymentDate) < new Date(filters.dateFrom)) return false
    }
    if (filters.dateTo && row.paymentDate) {
      if (new Date(row.paymentDate) > new Date(`${filters.dateTo}T23:59:59`)) return false
    }
    return true
  })
}

export function sortRows(rows, sortKey, direction = 'asc') {
  if (!sortKey) return rows
  const mult = direction === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult
    return String(av).localeCompare(String(bv)) * mult
  })
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}
