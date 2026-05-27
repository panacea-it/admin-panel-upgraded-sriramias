import { useEffect, useState } from 'react'
import { XCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import { cn } from '../../utils/cn'

const REJECT_REASONS = [
  'Invalid or unclear payment proof',
  'UTR / reference not found',
  'Amount mismatch',
  'Duplicate payment',
  'Other',
]

export default function VerificationRejectDialog({ open, row, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState(REJECT_REASONS[0])
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!open) return
    setReason(REJECT_REASONS[0])
    setComment('')
  }, [open, row?.id])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    onConfirm?.({ reason, comment: comment.trim() })
  }

  if (!row) return null

  return (
    <Modal open={open} onClose={onClose} size="md" title="Reject payment">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader
          title="Reject payment verification"
          onBack={onClose}
          icon={XCircle}
          iconClassName="text-[#df8284]"
        />
        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-sm text-[#686868]">
            Rejecting <span className="font-semibold text-[#222]">{row.student}</span> —{' '}
            <span className="font-mono text-xs">{row.id}</span>
          </p>
          <label className="block text-sm font-semibold text-[#333]">
            Rejection reason
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium"
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[#333]">
            Details <span className="text-[#df8284]">*</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              required
              placeholder="Explain why this payment was rejected…"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-[#444] hover:bg-white disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className={cn(
                'h-10 rounded-xl px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-60',
                'bg-gradient-to-r from-[#c96565] to-[#b94b4b]',
              )}
            >
              {loading ? 'Rejecting…' : 'Reject payment'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
