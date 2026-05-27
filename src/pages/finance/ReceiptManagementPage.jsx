import { useCallback, useEffect, useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'
import PageBanner from '../../components/figma/PageBanner'
import FinanceExportToolbar from '../../components/finance/FinanceExportToolbar'
import ReceiptCenterTable from '../../components/finance/receipt-center/ReceiptCenterTable'
import SendReceiptDialog from '../../components/finance/receipt-center/SendReceiptDialog'
import {
  fetchCompletedReceipts,
  sendReceiptCommunication,
} from '../../api/financeAPI'
import { filterReceiptCenterRows } from '../../utils/receiptCompletion'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { FINANCE_COURSES } from '../../data/financeMockData'
import { toast } from '../../utils/toast'

const RECEIPT_EXPORT_COLUMNS = [
  { key: 'receiptNumber', label: 'Receipt #' },
  { key: 'studentName', label: 'Student' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'courseName', label: 'Course' },
  { key: 'paymentTypeLabel', label: 'Payment Type' },
  { key: 'amountPaid', label: 'Amount Paid' },
  { key: 'receiptStatus', label: 'Receipt Status' },
  { key: 'paymentDate', label: 'Payment Date' },
]

const PAYMENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'Full Payment', label: 'Full Payment' },
  { value: 'EMI Completed', label: 'EMI Completed' },
]

export default function ReceiptManagementPage() {
  const { canReceipts, canExport } = useFinancePermissions()
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [courseId, setCourseId] = useState('all')
  const [paymentType, setPaymentType] = useState('all')
  const [centerName, setCenterName] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sendRow, setSendRow] = useState(null)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    try {
      setRows(await fetchCompletedReceipts())
    } catch {
      toast.error('Failed to load completed receipts')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const centerOptions = useMemo(() => {
    const names = [...new Set(rows.map((r) => r.centerName).filter(Boolean))]
    return names.sort()
  }, [rows])

  const filtered = useMemo(
    () =>
      filterReceiptCenterRows(rows, {
        search: debouncedSearch,
        courseId,
        paymentType,
        centerName,
        dateFrom,
        dateTo,
      }),
    [rows, debouncedSearch, courseId, paymentType, centerName, dateFrom, dateTo],
  )

  const handleSend = async (payload) => {
    if (!sendRow) return
    setSending(true)
    try {
      const updated = await sendReceiptCommunication(sendRow.id, payload)
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      toast.success(`Receipt sent via ${payload.channel}`)
      setSendRow(null)
    } catch {
      toast.error('Failed to send receipt')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6">
      <PageBanner icon={Receipt} title="Receipt Management" iconClassName="text-[#246392]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/40">
            {filtered.length} receipt{filtered.length !== 1 ? 's' : ''}
          </span>
          <FinanceExportToolbar
            rows={filtered}
            filenameBase="completed-receipts"
            columnDefs={RECEIPT_EXPORT_COLUMNS}
            canExport={canExport}
            variant="banner"
          />
        </div>
      </PageBanner>

      <p className="-mt-2 text-sm text-[#686868] sm:px-1">
        Manage completed payment receipts and communication — fully paid students and EMI-completed
        enrollments only.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="block sm:col-span-2 lg:col-span-2">
            <span className="text-xs font-semibold text-[#555]">Search</span>
            <input
              type="search"
              placeholder="Receipt #, student, mobile, course…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#55ace7] focus:ring-2 focus:ring-[#55ace7]/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#555]">Course</span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="all">All courses</option>
              {FINANCE_COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#555]">Payment type</span>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm"
            >
              {PAYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#555]">Center</span>
            <select
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="all">All centers</option>
              {centerOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#555]">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#555]">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm"
            />
          </label>
        </div>
      </div>

      <ReceiptCenterTable
        rows={filtered}
        canSend={canReceipts}
        onSendReceipt={setSendRow}
      />

      <SendReceiptDialog
        open={!!sendRow}
        row={sendRow}
        onClose={() => setSendRow(null)}
        onSend={handleSend}
        sending={sending}
      />
    </div>
  )
}
