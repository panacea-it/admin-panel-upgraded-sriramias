import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  Check,
  X,
  Eye,
  RotateCcw,
  ArrowUpRight,
  Plus,
  Loader2,
} from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceFilterPanel from '../../components/finance/FinanceFilterPanel'
import FinanceExportToolbar from '../../components/finance/FinanceExportToolbar'
import VerificationStatusBadge from '../../components/finance/VerificationStatusBadge'
import ProofViewerModal from '../../components/finance/ProofViewerModal'
import ConfirmActionDialog from '../../components/batch-management/ConfirmActionDialog'
import VerificationRejectDialog from '../../components/finance/VerificationRejectDialog'
import VerificationEscalateDialog from '../../components/finance/VerificationEscalateDialog'
import AddOfflinePaymentModal from '../../components/finance/AddOfflinePaymentModal'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import {
  fetchVerificationQueue,
  approveVerification,
  rejectVerification,
  escalateVerification,
  requestVerificationReupload,
  submitOfflinePaymentReport,
  resetVerificationQueue,
  generateReceipt,
} from '../../api/financeAPI'
import { FINANCE_VERIFICATION_STATUSES } from '../../constants/financeConstants'
import { VERIFICATION_QUEUE_EXPORT_COLUMNS } from '../../constants/financeVerification'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { useFinanceOperations } from '../../contexts/FinanceOperationsContext'
import { toast } from '../../utils/toast'
import { cn } from '../../utils/cn'

function canActOnRow(row) {
  const st = row.verificationStatus
  return ['Pending Verification', 'Under Review', 'Escalated'].includes(st)
}

function canApproveRow(row) {
  return canActOnRow(row) && row.verificationStatus !== 'Rejected'
}

export default function PaymentVerificationCenterPage() {
  const { canApprove, canEdit, canReceipts, canExport } = useFinancePermissions()
  const { bumpRefresh } = useFinanceOperations()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 200)
  const [statusFilter, setStatusFilter] = useState('all')
  const [proofRow, setProofRow] = useState(null)
  const [approveRow, setApproveRow] = useState(null)
  const [rejectRow, setRejectRow] = useState(null)
  const [escalateRow, setEscalateRow] = useState(null)
  const [offlineOpen, setOfflineOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setQueue(await fetchVerificationQueue())
    } catch {
      toast.error('Failed to load verification queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return queue.filter((row) => {
      const st = row.verificationStatus
      if (statusFilter !== 'all' && st !== statusFilter) return false
      if (!q) return true
      const hay = [
        row.student,
        row.studentId,
        row.id,
        row.utrNumber,
        row.course,
        row.centerName,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [queue, debouncedSearch, statusFilter])

  const handleReset = async () => {
    setSearch('')
    setStatusFilter('all')
    setLoading(true)
    try {
      setQueue(await resetVerificationQueue())
      toast.success('Filters cleared and queue reloaded')
    } catch {
      toast.error('Failed to reset')
      load()
    } finally {
      setLoading(false)
    }
  }

  const handleApproveConfirm = async () => {
    if (!approveRow) return
    setActionLoading(true)
    try {
      await approveVerification(approveRow.id, {
        adminName: 'Verifier',
        comment: 'Payment verified successfully',
      })
      if (canReceipts) {
        try {
          await generateReceipt(approveRow.id)
        } catch {
          /* receipt optional in mock */
        }
      }
      toast.success(`${approveRow.student} approved — moved to Student Payment Reports`)
      setApproveRow(null)
      await load()
      bumpRefresh()
    } catch {
      toast.error('Approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (payload) => {
    if (!rejectRow) return
    setActionLoading(true)
    try {
      await rejectVerification(rejectRow.id, { ...payload, adminName: 'Verifier' })
      toast.success('Payment rejected')
      setRejectRow(null)
      load()
    } catch {
      toast.error('Rejection failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEscalate = async (payload) => {
    if (!escalateRow) return
    setActionLoading(true)
    try {
      await escalateVerification(escalateRow.id, { ...payload, adminName: 'Finance Admin' })
      toast.success('Escalated for senior review')
      setEscalateRow(null)
      load()
    } catch {
      toast.error('Escalation failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReupload = async (row) => {
    setActionLoading(true)
    try {
      await requestVerificationReupload(row.id, {
        note: 'Please re-upload clearer payment proof',
        adminName: 'Finance Admin',
      })
      toast.success('Re-upload requested — status set to Under Review')
      load()
    } catch {
      toast.error('Request failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOfflineSubmit = async (form) => {
    setActionLoading(true)
    try {
      const result = await submitOfflinePaymentReport(form)
      if (result?.draft) {
        toast.success('Offline payment saved as draft')
      } else if (form.submitAction === 'emi_plan') {
        toast.success('EMI plan saved successfully')
      } else if (form.submitAction === 'receipt' && result?.receiptId) {
        await generateReceipt(result.receiptId)
        toast.success('Payment approved and receipt generated')
      } else if (form.emiEnabled && result?.emiPlan) {
        toast.success('Offline payment approved with EMI plan activated')
      } else {
        toast.success('Offline payment approved and added to Student Payment Reports')
      }
      setOfflineOpen(false)
      bumpRefresh()
    } catch {
      toast.error('Failed to submit offline payment')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Payment ID',
        cellClassName: 'whitespace-nowrap align-middle',
        render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span>,
      },
      {
        key: 'student',
        label: 'Student',
        cellClassName: 'align-middle',
        render: (r) => <span className="font-medium">{r.student}</span>,
      },
      { key: 'centerName', label: 'Center', cellClassName: 'align-middle' },
      { key: 'course', label: 'Course', cellClassName: 'align-middle max-w-[180px]' },
      { key: 'paymentMode', label: 'Mode', cellClassName: 'whitespace-nowrap align-middle' },
      {
        key: 'amount',
        label: 'Amount',
        cellClassName: 'whitespace-nowrap align-middle tabular-nums',
        render: (r) => formatINR(r.amount),
      },
      {
        key: 'utrNumber',
        label: 'UTR',
        cellClassName: 'whitespace-nowrap align-middle',
        render: (r) => (
          <span className="font-mono text-xs text-[#246392]">{r.utrNumber || '—'}</span>
        ),
      },
      {
        key: 'proof',
        label: 'Proof',
        cellClassName: 'whitespace-nowrap align-middle',
        render: (r) => (
          <button
            type="button"
            onClick={() => setProofRow(r)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#246392] hover:underline"
          >
            <Eye className="h-4 w-4" /> View
          </button>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        cellClassName: 'whitespace-nowrap align-middle',
        render: (r) => <VerificationStatusBadge status={r.verificationStatus} />,
      },
      {
        key: 'actions',
        label: 'Actions',
        cellClassName: 'align-middle min-w-[200px]',
        render: (row) => {
          const actionable = canApprove && canApproveRow(row)
          const rejected = row.verificationStatus === 'Rejected'
          return (
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setProofRow(row)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#246392] hover:bg-[#eef6fc]"
                title="View proof"
              >
                <Eye className="h-3.5 w-3.5" /> View
              </button>
              {actionable && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setApproveRow(row)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#69df66] px-2 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setRejectRow(row)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#df8284] px-2 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setEscalateRow(row)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#efb36d] px-2 py-1 text-xs font-semibold text-[#111] hover:opacity-90 disabled:opacity-50"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" /> Escalate
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleReupload(row)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#efb36d] bg-amber-50 px-2 py-1 text-xs font-semibold text-[#111] hover:bg-amber-100 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Re-upload
                  </button>
                </>
              )}
              {rejected && (
                <span className="text-xs text-[#686868]">No further actions</span>
              )}
              {!canApprove && !canEdit && (
                <span className="text-xs text-[#686868]">View only</span>
              )}
            </div>
          )
        },
      },
    ],
    [canApprove, canEdit, actionLoading],
  )

  const addOfflineBtn =
    'inline-flex h-10 items-center gap-2 rounded-lg bg-white/20 px-3 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/30'

  return (
    <FinancePageShell
      icon={ShieldCheck}
      title="Payment Verification Center"
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {(canApprove || canEdit) && (
            <button type="button" onClick={() => setOfflineOpen(true)} className={addOfflineBtn}>
              <Plus className="h-4 w-4" /> Add Offline Payment
            </button>
          )}
          <FinanceExportToolbar
            rows={filtered}
            filenameBase="verification-queue"
            canExport={canExport}
            variant="banner"
            columnDefs={VERIFICATION_QUEUE_EXPORT_COLUMNS}
          />
        </div>
      }
    >
      <FinanceFilterPanel
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        searchPlaceholder="Search student, UTR, payment ID…"
        selects={[
          {
            label: 'Verification status',
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            options: [
              { value: 'all', label: 'All statuses' },
              ...FINANCE_VERIFICATION_STATUSES.map((s) => ({ value: s, label: s })),
            ],
          },
        ]}
        onReset={handleReset}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[#686868]">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </span>
          ) : (
            <>
              {filtered.length} verification record{filtered.length === 1 ? '' : 's'}
              <span className="ml-2 hidden text-xs text-[#9ca0a8] sm:inline">
                Hover status badges for descriptions
              </span>
            </>
          )}
        </p>
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="verifications"
        resetDeps={[debouncedSearch, statusFilter, queue.length]}
        density="compact"
        rowClassName="hover:bg-slate-50/90 [&_td]:align-middle"
        tableClassName={cn(
          '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10',
          '[&_tbody_td]:align-middle',
        )}
        emptyMessage={
          loading
            ? 'Loading verification queue…'
            : 'No verification records match your filters.'
        }
      />

      <ProofViewerModal
        open={!!proofRow}
        onClose={() => setProofRow(null)}
        title="Payment verification proof"
        proofName={proofRow?.paymentProof}
        utr={proofRow?.utrNumber}
        notes={proofRow?.remarks}
      />

      <ConfirmActionDialog
        open={!!approveRow}
        title="Approve payment?"
        message={
          approveRow
            ? `Confirm verification for ${approveRow.student} (${approveRow.id}). This record will be removed from the verification queue and appear in Student Payment Reports as Paid.`
            : ''
        }
        confirmLabel="Approve"
        variant="primary"
        loading={actionLoading}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveRow(null)}
      />

      <VerificationRejectDialog
        open={!!rejectRow}
        row={rejectRow}
        onClose={() => setRejectRow(null)}
        onConfirm={handleReject}
        loading={actionLoading}
      />

      <VerificationEscalateDialog
        open={!!escalateRow}
        row={escalateRow}
        onClose={() => setEscalateRow(null)}
        onConfirm={handleEscalate}
        loading={actionLoading}
      />

      <AddOfflinePaymentModal
        open={offlineOpen}
        onClose={() => setOfflineOpen(false)}
        onSubmit={handleOfflineSubmit}
        loading={actionLoading}
      />
    </FinancePageShell>
  )
}
