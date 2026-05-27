import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banknote, Check, X, Eye } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatCard from '../../components/finance/FinanceStatCard'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import FinanceFilterPanel from '../../components/finance/FinanceFilterPanel'
import FinanceExportToolbar from '../../components/finance/FinanceExportToolbar'
import FinanceLinkedActions from '../../components/finance/FinanceLinkedActions'
import ProofViewerModal from '../../components/finance/ProofViewerModal'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchOfflineApprovals, approveOfflinePayment } from '../../api/financeAPI'
import { FINANCE_OFFLINE_STATUSES } from '../../constants/financeConstants'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { useFinanceOperations } from '../../contexts/FinanceOperationsContext'
import { toast } from '../../utils/toast'

export default function OfflinePaymentApprovalPage() {
  const { canApprove, canExport } = useFinancePermissions()
  const { bumpRefresh } = useFinanceOperations()
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = useState('Pending Approval')
  const [proofRow, setProofRow] = useState(null)

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
      return `${row.studentName} ${row.course} ${row.id} ${row.utrNumber}`.toLowerCase().includes(q)
    })
  }, [requests, debouncedSearch, statusFilter])

  const pendingCount = requests.filter((r) => r.status === 'Pending Approval' || r.status === 'Pending').length

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
      bumpRefresh()
    } catch {
      toast.error('Action failed')
    }
  }

  const columns = [
    { key: 'id', label: 'Request ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'studentName', label: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: 'centerName', label: 'Center' },
    { key: 'course', label: 'Course' },
    { key: 'amount', label: 'Amount', render: (r) => formatINR(r.amount) },
    { key: 'paymentMode', label: 'Mode' },
    { key: 'utrNumber', label: 'UTR', render: (r) => <span className="font-mono text-xs">{r.utrNumber || '—'}</span> },
    {
      key: 'proof',
      label: 'Proof',
      render: (r) => (
        <button
          type="button"
          onClick={() => setProofRow(r)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#246392]"
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
      ),
    },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
    { key: 'requestedDate', label: 'Requested', render: (r) => formatCategoryDateTime(r.requestedDate) },
    {
      key: 'actions',
      label: 'Decision',
      render: (row) => {
        const pending = row.status === 'Pending Approval' || row.status === 'Pending'
        return pending && canApprove ? (
          <div className="flex flex-col gap-1">
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
            <FinanceLinkedActions row={{ ...row, studentId: row.studentId }} compact />
          </div>
        ) : (
          <FinanceStatusBadge status={row.status} />
        )
      },
    },
  ]

  return (
    <FinancePageShell
      icon={Banknote}
      title="Offline Payment Approval"
      actions={
        <FinanceExportToolbar
          rows={filtered}
          filenameBase="offline-approvals"
          title="Offline Approvals"
          canExport={canExport}
          variant="banner"
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <FinanceStatCard label="Pending approval" value={pendingCount} icon={Banknote} />
        <FinanceStatCard label="Total requests" value={requests.length} />
        <FinanceStatCard
          label="Approved"
          value={requests.filter((r) => r.status === 'Approved').length}
          accent="from-[#69df66] to-[#55ace7]"
        />
      </div>

      <FinanceFilterPanel
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        searchPlaceholder="Search student, UTR, request…"
        selects={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            options: [{ value: 'all', label: 'All' }, ...FINANCE_OFFLINE_STATUSES.map((s) => ({ value: s, label: s }))],
          },
        ]}
        onReset={() => {
          setSearch('')
          setStatusFilter('Pending Approval')
        }}
      />

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="requests"
        resetDeps={[debouncedSearch, statusFilter]}
        tableClassName="[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
      />

      <ProofViewerModal
        open={!!proofRow}
        onClose={() => setProofRow(null)}
        title="Offline payment proof"
        proofName={proofRow?.paymentProof}
        utr={proofRow?.utrNumber}
        notes={proofRow?.verificationNotes}
      />
    </FinancePageShell>
  )
}
