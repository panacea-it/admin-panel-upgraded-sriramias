import { useCallback, useEffect, useMemo, useState } from 'react'
import { History } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchPaymentAttemptLogs } from '../../api/financeAPI'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { toast } from '../../utils/toast'

export default function PaymentAttemptLogsPage() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')

  const load = useCallback(async () => {
    try {
      setLogs(await fetchPaymentAttemptLogs())
    } catch {
      toast.error('Failed to load attempt logs')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return logs.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (modeFilter !== 'all' && row.paymentMode !== modeFilter) return false
      if (!q) return true
      return `${row.student} ${row.transactionId} ${row.course}`.toLowerCase().includes(q)
    })
  }, [logs, debouncedSearch, statusFilter, modeFilter])

  const columns = [
    { key: 'student', label: 'Student', render: (r) => <span className="font-medium">{r.student}</span> },
    { key: 'course', label: 'Course' },
    { key: 'attemptNo', label: 'Attempt' },
    { key: 'transactionId', label: 'Txn ID', render: (r) => <span className="font-mono text-xs">{r.transactionId}</span> },
    { key: 'paymentMode', label: 'Mode' },
    { key: 'amount', label: 'Amount', render: (r) => formatINR(r.amount) },
    { key: 'gatewayStatus', label: 'Gateway' },
    { key: 'gatewayMessage', label: 'Message' },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
    { key: 'dateTime', label: 'Date', render: (r) => formatCategoryDateTime(r.dateTime) },
  ]

  return (
    <FinancePageShell icon={History} title="Payment Attempt Logs">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search student, txn…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
        </select>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All modes</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
        </select>
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="attempts"
        resetDeps={[debouncedSearch, statusFilter, modeFilter]}
      />
    </FinancePageShell>
  )
}
