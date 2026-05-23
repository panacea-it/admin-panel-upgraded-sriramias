import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileSpreadsheet, Eye, Pencil, Receipt, Bell, Columns3, Download } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import PaymentViewDrawer from '../../components/finance/PaymentViewDrawer'
import PaymentEditModal from '../../components/finance/PaymentEditModal'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import {
  fetchPaymentReports,
  updatePaymentStatus,
  sendPaymentReminder,
  generateReceipt,
  resendReceipt,
} from '../../api/financeAPI'
import { FINANCE_BRANCHES, FINANCE_COURSES } from '../../data/financeMockData'
import { filterPaymentReports, formatINR } from '../../utils/financeFilters'
import { exportToCsv, exportToExcel, printReport } from '../../utils/financeExport'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

const ALL_COLUMNS = [
  { key: 'studentName', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'courseName', label: 'Course' },
  { key: 'paymentStatus', label: 'Status' },
  { key: 'paymentType', label: 'Type' },
  { key: 'amountPaid', label: 'Paid' },
  { key: 'pendingAmount', label: 'Pending' },
  { key: 'paymentMode', label: 'Mode' },
  { key: 'branch', label: 'Branch' },
  { key: 'paymentDate', label: 'Date' },
]

const DEFAULT_VISIBLE = ['studentName', 'courseName', 'paymentStatus', 'amountPaid', 'pendingAmount', 'paymentMode', 'paymentDate']

export default function StudentPaymentReportsPage() {
  const { canEdit, canExport, canReceipts } = useFinancePermissions()
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    paymentType: 'all',
    paymentMode: 'all',
    courseType: 'all',
    courseId: 'all',
    branch: 'all',
    dateFrom: '',
    dateTo: '',
    studentId: '',
    studentName: '',
    mobile: '',
  })
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE)
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [editForm, setEditForm] = useState({ newStatus: 'Paid', amountAdjustment: '', reason: 'Manual Approval', comment: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await fetchPaymentReports()
      setRows(data)
    } catch {
      toast.error('Failed to load payment reports')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () => filterPaymentReports(rows, { ...filters, search: debouncedSearch }),
    [rows, filters, debouncedSearch],
  )

  const exportCols = ALL_COLUMNS.map((c) => ({
    key: c.key,
    label: c.label,
    export: (row) => {
      if (c.key === 'amountPaid' || c.key === 'pendingAmount') return formatINR(row[c.key])
      if (c.key === 'paymentDate') return formatCategoryDateTime(row.paymentDate)
      if (c.key === 'paymentStatus') return row.paymentStatus
      return row[c.key]
    },
  }))

  const handleExportCsv = () => {
    if (!canExport) return toast.error('Export not permitted')
    exportToCsv('student-payments.csv', exportCols, filtered)
    toast.success('CSV exported')
  }

  const handleSaveEdit = async () => {
    if (!editRow) return
    setSaving(true)
    try {
      await updatePaymentStatus(editRow.id, {
        newStatus: editForm.newStatus,
        amountAdjustment: editForm.amountAdjustment,
        comment: `${editForm.reason}: ${editForm.comment}`,
        adminName: 'Admin',
      })
      toast.success('Payment updated')
      setEditRow(null)
      load()
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleReminder = async (row) => {
    try {
      await sendPaymentReminder({ mobile: row.mobile, email: row.email, channel: 'WhatsApp' })
      toast.success('Reminder queued')
    } catch {
      toast.error('Reminder failed')
    }
  }

  const handleReceipt = async (row) => {
    try {
      await generateReceipt(row.id)
      toast.success('Receipt generated')
      load()
    } catch {
      toast.error('Receipt generation failed')
    }
  }

  const handlePrintReceipt = (row) => {
    window.open(`/finance/receipts?preview=${row.id}`, '_blank')
  }

  const handleResendReceipt = async (row, channel = 'Email') => {
    try {
      await resendReceipt(row.id, channel)
      toast.success(`Receipt sent via ${channel}`)
    } catch {
      toast.error('Failed to send receipt')
    }
  }

  const columns = useMemo(() => {
    const defs = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
      if (c.key === 'paymentStatus') {
        return { ...c, render: (r) => <FinanceStatusBadge status={r.paymentStatus} /> }
      }
      if (c.key === 'amountPaid' || c.key === 'pendingAmount') {
        return { ...c, render: (r) => formatINR(r[c.key]) }
      }
      if (c.key === 'paymentDate') {
        return { ...c, render: (r) => formatCategoryDateTime(r.paymentDate) }
      }
      if (c.key === 'studentName') {
        return {
          ...c,
          headerClassName: 'pl-6 sm:pl-10',
          cellClassName: 'pl-6 sm:pl-10',
          render: (r) => <span className="font-medium">{r.studentName}</span>,
        }
      }
      return c
    })
    defs.push({
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setViewRow(row)} className="rounded p-1.5 text-[#246392] hover:bg-[#eef6fc]" title="View">
            <Eye className="h-4 w-4" />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditRow(row)
                setEditForm({
                  newStatus: row.paymentStatus,
                  amountAdjustment: String(row.amountPaid),
                  reason: 'Manual Approval',
                  comment: '',
                })
              }}
              className="rounded p-1.5 text-[#246392] hover:bg-[#eef6fc]"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canReceipts && (
            <button type="button" onClick={() => handleReceipt(row)} className="rounded p-1.5 text-[#246392] hover:bg-[#eef6fc]" title="Receipt">
              <Receipt className="h-4 w-4" />
            </button>
          )}
          <button type="button" onClick={() => handleReminder(row)} className="rounded p-1.5 text-[#efb36d] hover:bg-amber-50" title="Reminder">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      ),
    })
    return defs
  }, [visibleCols, canEdit, canReceipts])

  return (
    <FinancePageShell
      icon={FileSpreadsheet}
      title="Student Payment Reports"
      actions={
        canExport && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleExportCsv} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1a3a5c] px-3 text-sm font-semibold text-white">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              type="button"
              onClick={() => {
                exportToExcel('student-payments.xls', exportCols, filtered)
                toast.success('Excel exported')
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/20 px-3 text-sm font-semibold text-white ring-1 ring-white/40"
            >
              Excel
            </button>
            <button
              type="button"
              onClick={() => printReport('Student Payments', exportCols, filtered)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/20 px-3 text-sm font-semibold text-white ring-1 ring-white/40"
            >
              Print
            </button>
          </div>
        )
      }
    >
      <div className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            placeholder="Search student, course, txn…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm lg:col-span-2"
          />
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {['Paid', 'Partial', 'Pending', 'Failed'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filters.paymentType}
            onChange={(e) => setFilters((f) => ({ ...f, paymentType: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All types</option>
            {['Full', 'EMI'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filters.paymentMode}
            onChange={(e) => setFilters((f) => ({ ...f, paymentMode: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All modes</option>
            {['UPI', 'Card', 'Bank Transfer', 'Cash'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filters.courseId}
            onChange={(e) => setFilters((f) => ({ ...f, courseId: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All courses</option>
            {FINANCE_COURSES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filters.branch}
            onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All branches</option>
            {FINANCE_BRANCHES.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            placeholder="Student ID"
            value={filters.studentId}
            onChange={(e) => setFilters((f) => ({ ...f, studentId: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            placeholder="Mobile"
            value={filters.mobile}
            onChange={(e) => setFilters((f) => ({ ...f, mobile: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[#686868]">{filtered.length} records</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setColMenuOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#246392]"
          >
            <Columns3 className="h-4 w-4" /> Columns
          </button>
          {colMenuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-100 bg-white p-2 shadow-lg">
              {ALL_COLUMNS.map((c) => (
                <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(c.key)}
                    onChange={() => {
                      setVisibleCols((prev) =>
                        prev.includes(c.key) ? prev.filter((k) => k !== c.key) : [...prev, c.key],
                      )
                    }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="payments"
        resetDeps={[debouncedSearch, filters, visibleCols]}
        rowClassName="hover:bg-slate-50/90"
      />

      <PaymentViewDrawer
        open={!!viewRow}
        payment={viewRow}
        onClose={() => setViewRow(null)}
        canReceipts={canReceipts}
        onDownloadReceipt={handleReceipt}
        onPrintReceipt={handlePrintReceipt}
        onResendReceipt={(row) => handleResendReceipt(row, 'Email')}
        onWhatsAppReceipt={(row) => handleResendReceipt(row, 'WhatsApp')}
      />
      <PaymentEditModal
        open={!!editRow}
        payment={editRow}
        form={editForm}
        onChange={setEditForm}
        onClose={() => setEditRow(null)}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </FinancePageShell>
  )
}
