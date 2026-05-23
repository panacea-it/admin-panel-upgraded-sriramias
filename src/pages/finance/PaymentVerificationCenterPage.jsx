import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShieldCheck, Check, X } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchVerificationQueue, updatePaymentStatus } from '../../api/financeAPI'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

export default function PaymentVerificationCenterPage() {
  const { canApprove, canEdit } = useFinancePermissions()
  const [queue, setQueue] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    try {
      setQueue(await fetchVerificationQueue())
    } catch {
      toast.error('Failed to load verification queue')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return queue.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!q) return true
      return `${row.student} ${row.course} ${row.id}`.toLowerCase().includes(q)
    })
  }, [queue, debouncedSearch, statusFilter])

  const handleDecision = async (row, approved) => {
    if (!canApprove && !canEdit) {
      toast.error('Not permitted')
      return
    }
    try {
      await updatePaymentStatus(row.id, {
        newStatus: approved ? 'Paid' : 'Failed',
        comment: approved ? 'Verification approved' : 'Verification rejected',
        adminName: 'Verifier',
      })
      toast.success(approved ? 'Payment approved' : 'Payment rejected')
      load()
    } catch {
      toast.error('Action failed')
    }
  }

  const columns = [
    { key: 'id', label: 'Payment ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'student', label: 'Student', render: (r) => <span className="font-medium">{r.student}</span> },
    { key: 'course', label: 'Course' },
    { key: 'amount', label: 'Amount', render: (r) => formatINR(r.amount) },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
    { key: 'submittedAt', label: 'Submitted', render: (r) => formatCategoryDateTime(r.submittedAt) },
    {
      key: 'actions',
      label: 'Verify',
      render: (row) =>
        canApprove ? (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleDecision(row, true)}
              className="inline-flex items-center gap-1 rounded-md bg-[#69df66] px-2 py-1 text-xs font-semibold text-white"
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
            <button
              type="button"
              onClick={() => handleDecision(row, false)}
              className="inline-flex items-center gap-1 rounded-md bg-[#df8284] px-2 py-1 text-xs font-semibold text-white"
            >
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#686868]">View only</span>
        ),
    },
  ]

  return (
    <FinancePageShell icon={ShieldCheck} title="Payment Verification Center">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search queue…"
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
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
        </select>
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="items"
        resetDeps={[debouncedSearch, statusFilter]}
      />
    </FinancePageShell>
  )
}
