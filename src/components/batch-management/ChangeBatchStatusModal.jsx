import { useEffect, useState } from 'react'
import BatchFormModalShell from './BatchFormModalShell'
import BatchStatusSelector from './BatchStatusSelector'
import BatchStatusBadge from './BatchStatusBadge'

export default function ChangeBatchStatusModal({
  open,
  onClose,
  batch,
  onSubmit,
  saving = false,
}) {
  const [nextStatus, setNextStatus] = useState(batch?.status || 'Active')

  useEffect(() => {
    if (open && batch) setNextStatus(batch.status || 'Active')
  }, [open, batch])

  if (!batch) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (nextStatus === batch.status) {
      onClose?.()
      return
    }
    onSubmit?.(nextStatus)
  }

  return (
    <BatchFormModalShell
      open={open}
      onClose={onClose}
      title="Change Batch Status"
      subtitle={batch.displayName}
      size="md"
      saving={saving}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-[#444] transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="change-batch-status-form"
            disabled={saving || nextStatus === batch.status}
            className="h-11 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-8 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving ? 'Updating…' : 'Update Status'}
          </button>
        </div>
      }
    >
      <form id="change-batch-status-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-[#f8fbff] p-4 ring-1 ring-[#55ace7]/15">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#686868]">
            Current Status
          </p>
          <div className="mt-2">
            <BatchStatusBadge status={batch.status} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#686868]">
            New Status
          </p>
          <BatchStatusSelector
            status={nextStatus}
            onStatusChange={setNextStatus}
          />
        </div>
      </form>
    </BatchFormModalShell>
  )
}
