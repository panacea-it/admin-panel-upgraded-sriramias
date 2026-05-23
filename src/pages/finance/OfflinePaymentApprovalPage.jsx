import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banknote, Check, X, FileImage } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatCard from '../../components/finance/FinanceStatCard'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchOfflineApprovals, approveOfflinePayment } from '../../api/financeAPI'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

export default function OfflinePaymentApprovalPage() {
  const { canApprove } = useFinancePermissions()
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = useState('Pending')

  const load = useCallback(async () => {
    try {
      setRequests(await fetchOfflineApprovals())
    } catch {
      toast.error('Failed to load offline requests')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return requests.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!q) return true
      return `${row.studentName} ${row.course} ${row.id}`.toLowerCase().includes(q)
    })
  }, [requests, debouncedSearch, statusFilter])

  const pendingCount = requests.filter((r) => r.status === 'Pending').length

  const handleDecision = async (row, approved) => {
    if (!canApprove) {
      toast.error('Not permitted')
      return
    }
    try {
      await approveOfflinePayment(row.id, {
        newStatus: approved ? 'Approved' : 'Rejected',
        comment: approved ? 'Proof verified' : 'Invalid proof',
      })
      toast.success(approved ? 'Payment approved' : 'Request rejected')
      load()
    } catch {
      toast.error('Action failed')
    }
  }

  const columns = [
    { key: 'id', label: 'Request ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'studentName', label: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: 'course', label: 'Course' },
    { key: 'amount', label: 'Amount', render: (r) => formatINR(r.amount) },
    { key: 'paymentMode', label: 'Mode' },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
    { key: 'requestedDate', label: 'Requested', render: (r) => formatCategoryDateTime(r.requestedDate) },
    {
      key: 'proof',
      label: 'Proof',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs text-[#246392]">
          <FileImage className="h-4 w-4" />
          {r.paymentProof}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Decision',
      render: (row) =>
        row.status === 'Pending' && canApprove ? (
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
          <span className="text-xs text-[#686868]">{row.status}</span>
        ),
    },
  ]

  return (
    <FinancePageShell icon={Banknote} title="Offline Payment Approval">
      <div className="grid gap-4 sm:grid-cols-3">
        <FinanceStatCard label="Pending requests" value={pendingCount} icon={Banknote} />
        <FinanceStatCard label="Total requests" value={requests.length} />
        <FinanceStatCard
          label="Approved"
          value={requests.filter((r) => r.status === 'Approved').length}
          accent="from-[#69df66] to-[#55ace7]"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search requests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="requests"
        resetDeps={[debouncedSearch, statusFilter]}
      />
    </FinancePageShell>
  )
}
