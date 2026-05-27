import { enrichFinanceRecord } from './financeRecordModel'

const EXCLUDED_STATUSES = new Set([
  'Partially Paid',
  'Partial',
  'Pending',
  'Overdue',
  'Failed',
  'Verification Pending',
  'EMI Running',
  'Pending Payment',
])

/** Only fully paid or EMI-completed students belong in Receipt Management */
export function isCompletedPaymentReceipt(row) {
  const r = enrichFinanceRecord(row)
  const pending = Number(r.pendingAmount) || 0

  if (EXCLUDED_STATUSES.has(r.paymentStatus)) return false
  if (r.emiStatus === 'EMI Running') return false
  if (pending > 0) return false

  if (r.paymentStatus === 'EMI Completed' || r.emiStatus === 'EMI Completed') return true

  if (r.paymentStatus === 'Paid' || r.paymentStatus === 'Verified') {
    if (r.paymentType === 'EMI') {
      return pending <= 0 && (r.emiStatus === 'EMI Completed' || !r.emiStatus || r.emiStatus === '—')
    }
    return true
  }

  return false
}

export function filterCompletedReceipts(rows = []) {
  return (rows || []).filter(isCompletedPaymentReceipt).map(mapReceiptCenterRow)
}

export function mapReceiptCenterRow(row) {
  const r = enrichFinanceRecord(row)
  const isEmiCompleted =
    r.paymentStatus === 'EMI Completed' ||
    r.emiStatus === 'EMI Completed' ||
    (r.paymentType === 'EMI' && (r.pendingAmount || 0) <= 0)

  const receiptStatus = isEmiCompleted ? 'EMI Completed' : 'Paid'
  const paymentTypeLabel = isEmiCompleted ? 'EMI Completed' : 'Full Payment'

  return {
    ...r,
    receiptStatus,
    paymentTypeLabel,
    amountPaid: r.amountPaid ?? r.totalFees ?? 0,
    receiptNumber: r.receiptNumber || buildReceiptNumber(r.id),
    communications: normalizeCommunications(r.receiptCommunications),
    receiptAudit: {
      generatedBy: r.receiptGeneratedBy || r.approvedBy || r.createdBy || 'Finance Admin',
      generatedAt: r.receiptGeneratedAt || r.paymentDate || new Date().toISOString(),
      sentBy: r.receiptSentBy || null,
      sentAt: r.receiptSentAt || null,
    },
    emiCompletionNote: isEmiCompleted
      ? r.emiCompletionNote || 'All EMI installments have been successfully completed.'
      : null,
  }
}

function normalizeCommunications(comms = {}) {
  const channels = ['whatsapp', 'sms', 'email']
  const out = {}
  channels.forEach((ch) => {
    const entry = comms[ch] || comms[ch.charAt(0).toUpperCase() + ch.slice(1)] || null
    out[ch] = entry
      ? {
          status: entry.status || 'Not Sent',
          sentAt: entry.sentAt || null,
          sentBy: entry.sentBy || null,
        }
      : { status: 'Not Sent', sentAt: null, sentBy: null }
  })
  return out
}

export function buildReceiptNumber(paymentId) {
  const suffix = String(paymentId || '').replace(/\D/g, '').slice(-4) || Date.now().toString().slice(-4)
  return `RCP-2026-${suffix.padStart(4, '0')}`
}

export function ensureReceiptOnRecord(row) {
  if (row.receiptNumber) return row
  return {
    ...row,
    receiptNumber: buildReceiptNumber(row.id),
    receiptGeneratedAt: new Date().toISOString(),
    receiptGeneratedBy: 'Finance Admin',
  }
}

export function buildReceiptMessage(row, channel = 'WhatsApp') {
  const name = row.studentName?.split(' ')[0] || 'Student'
  const course = row.courseName || 'your course'
  const amount = row.amountPaid ?? row.totalFees
  const receipt = row.receiptNumber || '—'

  if (channel === 'SMS') {
    return `Dear ${name}, payment of Rs.${amount} for ${course} is complete. Receipt ${receipt}. Thank you — Sriram IAS.`
  }
  if (channel === 'Email') {
    return `Dear ${row.studentName},\n\nYour payment for ${course} has been successfully completed.\nReceipt Number: ${receipt}\nAmount Paid: ₹${amount?.toLocaleString('en-IN')}\n\n${row.emiCompletionNote ? `${row.emiCompletionNote}\n\n` : ''}Thank you for choosing Sriram IAS.\n\nRegards,\nFinance Team`
  }
  return `Dear ${name}, your payment for ${course} has been successfully completed. Receipt ${receipt} is attached. Thank you — Sriram IAS.`
}

export function filterReceiptCenterRows(rows, filters = {}) {
  let list = [...rows]

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter(
      (r) =>
        (r.receiptNumber || '').toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        (r.mobile || '').includes(q) ||
        r.courseName.toLowerCase().includes(q),
    )
  }
  if (filters.courseId && filters.courseId !== 'all') {
    list = list.filter((r) => r.courseId === filters.courseId)
  }
  if (filters.paymentType && filters.paymentType !== 'all') {
    list = list.filter((r) => r.paymentTypeLabel === filters.paymentType)
  }
  if (filters.centerName && filters.centerName !== 'all') {
    list = list.filter((r) => r.centerName === filters.centerName)
  }
  if (filters.dateFrom) {
    list = list.filter((r) => r.paymentDate && new Date(r.paymentDate) >= new Date(filters.dateFrom))
  }
  if (filters.dateTo) {
    list = list.filter(
      (r) => r.paymentDate && new Date(r.paymentDate) <= new Date(`${filters.dateTo}T23:59:59`),
    )
  }

  return list
}

export function printReceiptDocument(row) {
  const html = buildReceiptHtml(row)
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
  return true
}

export function buildReceiptHtml(row) {
  const isEmi = row.receiptStatus === 'EMI Completed'
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt ${row.receiptNumber}</title>
<style>
body{font-family:system-ui,sans-serif;padding:32px;color:#111;max-width:800px;margin:0 auto}
.hdr{border-bottom:2px solid #1a3a5c;padding-bottom:16px;display:flex;justify-content:space-between}
.logo{font-size:22px;font-weight:800;color:#1a3a5c}
.meta{text-align:right;font-size:13px;color:#555}
.note{margin-top:16px;padding:12px;background:#eef6fc;border-radius:8px;font-size:13px;color:#246392}
table{width:100%;border-collapse:collapse;margin-top:24px;font-size:14px}
th{background:#246392;color:#fff;text-align:left;padding:8px}
td{border-bottom:1px solid #e2e8f0;padding:8px}
.total{margin-top:20px;text-align:right;font-size:18px;font-weight:700;color:#1a3a5c}
.footer{margin-top:40px;text-align:center;font-size:11px;color:#888}
.sign{margin-top:48px;display:flex;justify-content:space-between;font-size:12px}
.sign div{width:40%;border-top:1px solid #333;padding-top:8px}
</style></head><body>
<div class="hdr">
  <div><div class="logo">Sriram IAS</div><div style="font-size:13px;color:#686868">Fee Receipt / Tax Invoice</div></div>
  <div class="meta"><strong>${row.receiptNumber}</strong><br/>${new Date(row.paymentDate || Date.now()).toLocaleString('en-IN')}</div>
</div>
<div style="margin-top:20px;font-size:14px">
  <strong>Student:</strong> ${row.studentName} (${row.studentId})<br/>
  <strong>Mobile:</strong> ${row.mobile || '—'} · <strong>Email:</strong> ${row.email || '—'}<br/>
  <strong>Course:</strong> ${row.courseName} · ${row.centerName || row.branch || ''}
</div>
${isEmi ? `<div class="note"><strong>EMI Completed:</strong> ${row.emiCompletionNote || 'All installments settled.'}</div>` : ''}
<table><thead><tr><th>Description</th><th>Mode</th><th style="text-align:right">Amount</th></tr></thead>
<tbody><tr><td>${row.courseName}<br/><small>${row.paymentTypeLabel}</small></td><td>${row.paymentMode}</td><td style="text-align:right">₹${Number(row.amountPaid || 0).toLocaleString('en-IN')}</td></tr></tbody></table>
<div class="total">Total Paid: ₹${Number(row.amountPaid || 0).toLocaleString('en-IN')}</div>
<div class="sign"><div>Student / Parent</div><div>Finance Officer</div></div>
<div class="footer">Computer-generated receipt · GSTIN: 29ABCDESRI0001Z5</div>
</body></html>`
}
