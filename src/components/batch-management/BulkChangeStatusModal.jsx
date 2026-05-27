import { useState } from 'react'
import BatchFormModalShell from './BatchFormModalShell'
import BatchStatusSelector from './BatchStatusSelector'

export default function BulkChangeStatusModal({
  open,
  onClose,
  count,
  onSubmit,
  saving = false,
}) {
  const [status, setStatus] = useState('Active')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(status)
  }

  return (
    <BatchFormModalShell
      open={open}
      onClose={onClose}
      title="Bulk Change Status"
      subtitle={`${count} batch(es) selected`}
      size="md"
      saving={saving}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-[#444]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="bulk-status-form"
            disabled={saving}
            className="h-11 rounded-xl bg-gradient-to-r from-[#55ace7] to-[#246392] px-8 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Updating…' : 'Apply to All'}
          </button>
        </div>
      }
    >
      <form id="bulk-status-form" onSubmit={handleSubmit}>
        <p className="mb-3 text-sm text-[#686868]">Choose the new status for all selected batches.</p>
        <BatchStatusSelector status={status} onStatusChange={setStatus} />
      </form>
    </BatchFormModalShell>
  )
}
