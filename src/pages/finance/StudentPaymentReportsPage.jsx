import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileSpreadsheet, Eye, Pencil, Receipt, Bell, Columns3, UserCircle, SearchX } from 'lucide-react'
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
import { FINANCE_COURSES } from '../../data/financeMockData'
import { filterPaymentReports, formatINR } from '../../utils/financeFilters'
import FinanceExportToolbar from '../../components/finance/FinanceExportToolbar'
import { useFinanceOperations } from '../../contexts/FinanceOperationsContext'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'
import { cn } from '../../utils/cn'

const ALL_COLUMNS = [
  { key: 'studentName', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'centerName', label: 'Center' },
  { key: 'courseName', label: 'Course' },
  { key: 'batchName', label: 'Batch' },
  { key: 'paymentStatus', label: 'Status' },
  { key: 'verificationStatus', label: 'Verification' },
  { key: 'emiStatus', label: 'EMI' },
  { key: 'paymentType', label: 'Type' },
  { key: 'totalFees', label: 'Total fees' },
  { key: 'amountPaid', label: 'Paid' },
  { key: 'pendingAmount', label: 'Pending' },
  { key: 'paymentMode', label: 'Mode' },
  { key: 'branch', label: 'Branch' },
  { key: 'receiptNumber', label: 'Receipt' },
  { key: 'paymentDate', label: 'Date' },
]

const DEFAULT_VISIBLE = [
  'studentName',
  'centerName',
  'courseName',
  'batchName',
  'paymentStatus',
  'amountPaid',
  'pendingAmount',
  'paymentMode',
  'paymentDate',
]

const COLUMN_ALIGN = {
  studentName: 'left',
  studentId: 'left',
  centerName: 'left',
  courseName: 'left',
  batchName: 'left',
  paymentStatus: 'center',
  verificationStatus: 'center',
  emiStatus: 'center',
  paymentType: 'left',
  totalFees: 'right',
  amountPaid: 'right',
  pendingAmount: 'right',
  paymentMode: 'left',
  branch: 'left',
  receiptNumber: 'left',
  paymentDate: 'center',
  actions: 'center',
}

const PAYMENT_STATUS_PILL = {
  Paid: 'bg-[#69df66] text-white',
  Pending: 'bg-[#efb36d] text-[#111111]',
  Partial: 'bg-[#efb36d] text-[#111111]',
  Failed: 'bg-[#df8284] text-white',
  'EMI Running': 'bg-[#246392] text-white',
}

function PaymentStatusPill({ status }) {
  const label = status || '—'
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold leading-none',
        PAYMENT_STATUS_PILL[label] || 'bg-slate-200 text-slate-700',
      )}
    >
      {label}
    </span>
  )
}

function ReportActionButton({ onClick, title, children, variant = 'primary' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
        variant === 'primary' && 'text-[#246392] hover:bg-[#eef6fc]',
        variant === 'accent' && 'text-[#d97706] hover:bg-amber-50',
      )}
    >
      {children}
    </button>
  )
}

export default function StudentPaymentReportsPage() {
  const { canEdit, canExport, canReceipts } = useFinancePermissions()
  const { openStudentProfile, refreshToken } = useFinanceOperations()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableDensity, setTableDensity] = useState('compact')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    paymentType: 'all',
    paymentMode: 'all',
    courseId: 'all',
    centerName: 'all',
    dateFrom: '',
    dateTo: '',
    studentId: '',
    mobile: '',
  })
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE)
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [editForm, setEditForm] = useState({ newStatus: 'Paid', amountAdjustment: '', reason: 'Manual Approval', comment: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPaymentReports()
      setRows(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load payment reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshToken])

  const filtered = useMemo(
    () => filterPaymentReports(rows ?? [], { ...filters, search: debouncedSearch }),
    [rows, filters, debouncedSearch],
  )

  const centerOptions = useMemo(() => {
    const names = [...new Set((rows ?? []).map((r) => r?.centerName).filter(Boolean))]
    return names.sort()
  }, [rows])

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
      const base = {
        ...c,
        align: COLUMN_ALIGN[c.key] || 'left',
        headerClassName: cn(c.key === 'studentName' && 'pl-6 sm:pl-10'),
        cellClassName: cn(
          c.key === 'studentName' && 'pl-6 sm:pl-10',
          (c.key === 'paymentStatus' ||
            c.key === 'verificationStatus' ||
            c.key === 'emiStatus') &&
            'whitespace-nowrap',
          (c.key === 'amountPaid' || c.key === 'pendingAmount' || c.key === 'totalFees') &&
            'tabular-nums font-medium text-[#111111]',
          c.key === 'paymentDate' && 'whitespace-nowrap tabular-nums',
        ),
      }

      if (c.key === 'paymentStatus') {
        return { ...base, render: (r) => <PaymentStatusPill status={r.paymentStatus} /> }
      }
      if (c.key === 'verificationStatus' || c.key === 'emiStatus') {
        return {
          ...base,
          render: (r) => (
            <FinanceStatusBadge status={r[c.key]} className="rounded-full px-3 py-1 text-xs" />
          ),
        }
      }
      if (c.key === 'totalFees') {
        return { ...base, render: (r) => formatINR(r.totalFees) }
      }
      if (c.key === 'amountPaid' || c.key === 'pendingAmount') {
        return { ...base, render: (r) => formatINR(r[c.key]) }
      }
      if (c.key === 'paymentDate') {
        return {
          ...base,
          render: (r) => (
            <span className="inline-block whitespace-nowrap text-sm text-[#111111]">
              {formatCategoryDateTime(r.paymentDate)}
            </span>
          ),
        }
      }
      if (c.key === 'studentName') {
        return { ...base, render: (r) => <span className="font-semibold text-[#111111]">{r.studentName}</span> }
      }
      return base
    })

    defs.push({
      key: 'actions',
      label: 'Actions',
      align: 'center',
      headerClassName: 'min-w-[200px]',
      cellClassName: 'whitespace-nowrap bg-inherit',
      render: (row) => (
        <div className="flex flex-nowrap items-center justify-center gap-2.5">
          <ReportActionButton onClick={() => setViewRow(row)} title="View">
            <Eye className="h-4 w-4" strokeWidth={2} />
          </ReportActionButton>
          {canEdit && (
            <ReportActionButton
              title="Edit"
              onClick={() => {
                setEditRow(row)
                setEditForm({
                  newStatus: row.paymentStatus,
                  amountAdjustment: String(row.amountPaid),
                  reason: 'Manual Approval',
                  comment: '',
                })
              }}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </ReportActionButton>
          )}
          {canReceipts && (
            <ReportActionButton onClick={() => handleReceipt(row)} title="Receipt">
              <Receipt className="h-4 w-4" strokeWidth={2} />
            </ReportActionButton>
          )}
          <ReportActionButton onClick={() => handleReminder(row)} title="Notify" variant="accent">
            <Bell className="h-4 w-4" strokeWidth={2} />
          </ReportActionButton>
          <ReportActionButton
            onClick={() => openStudentProfile(row.studentId, row)}
            title="Profile"
          >
            <UserCircle className="h-4 w-4" strokeWidth={2} />
          </ReportActionButton>
        </div>
      ),
    })
    return defs
  }, [visibleCols, canEdit, canReceipts, openStudentProfile])

  return (
    <FinancePageShell
      icon={FileSpreadsheet}
      title="Student Payment Reports"
      actions={
        <FinanceExportToolbar
          rows={filtered}
          filenameBase="student-payment-reports"
          canExport={canExport}
          variant="banner"
        />
      }
    >
      <div className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="search"
              placeholder="Search student, course, txn…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2 lg:col-span-2"
            />
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              aria-label="Payment status"
            >
              <option value="all">All statuses</option>
              {['Paid', 'Partial', 'Pending', 'Failed'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters((f) => ({ ...f, paymentType: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              aria-label="Payment type"
            >
              <option value="all">All types</option>
              {['Full', 'EMI'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select
              value={filters.paymentMode}
              onChange={(e) => setFilters((f) => ({ ...f, paymentMode: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              aria-label="Payment mode"
            >
              <option value="all">All modes</option>
              {['UPI', 'Card', 'Bank Transfer', 'Cash'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={filters.courseId}
              onChange={(e) => setFilters((f) => ({ ...f, courseId: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              aria-label="Course"
            >
              <option value="all">All courses</option>
              {FINANCE_COURSES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filters.centerName}
              onChange={(e) => setFilters((f) => ({ ...f, centerName: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2 lg:col-span-1"
              aria-label="Center"
            >
              <option value="all">All centers</option>
              {centerOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              aria-label="From date"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              aria-label="To date"
            />
            <input
              placeholder="Student ID"
              value={filters.studentId}
              onChange={(e) => setFilters((f) => ({ ...f, studentId: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Mobile"
              value={filters.mobile}
              onChange={(e) => setFilters((f) => ({ ...f, mobile: e.target.value }))}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#686868]">
          {loading ? 'Loading…' : `${filtered.length} records`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
            role="group"
            aria-label="Table density"
          >
            {[
              { id: 'compact', label: 'Compact' },
              { id: 'comfortable', label: 'Comfortable' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTableDensity(id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  tableDensity === id
                    ? 'bg-[#246392] text-white shadow-sm'
                    : 'text-[#686868] hover:bg-slate-50',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setColMenuOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#246392] transition-colors hover:bg-slate-50"
            >
              <Columns3 className="h-4 w-4" /> Columns
            </button>
            {colMenuOpen && (
              <div className="absolute right-0 z-20 mt-1 max-h-72 w-52 overflow-y-auto rounded-lg border border-slate-100 bg-white p-2 shadow-lg">
                {ALL_COLUMNS.map((c) => (
                  <label
                    key={c.key}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50"
                  >
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
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="payments"
        resetDeps={[debouncedSearch, filters, visibleCols, tableDensity]}
        density={tableDensity}
        loading={loading}
        skeletonRowCount={8}
        zebraStriping
        stickyHeader
        stickyLastColumn
        animateRows
        emptyState={
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <SearchX className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-800">No finance reports available</p>
            <p className="max-w-sm text-sm text-slate-500">
              {rows.length === 0 && !loading
                ? 'There are no payment reports to show yet.'
                : 'No payments match your current filters. Try clearing search or adjusting status, course, or date range.'}
            </p>
          </div>
        }
        className="overflow-hidden rounded-xl border border-slate-100"
        tableClassName="max-h-[min(70vh,720px)] overflow-auto"
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
