import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import BatchFormModalShell from './BatchFormModalShell'
import {
  canTransferToBatch,
  getAvailableSeats,
  getBatchCapacity,
  getBatchStrength,
  NON_TRANSFER_TARGET_STATUSES,
} from '../../utils/batchOperations'
import { cn } from '../../utils/cn'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#222] outline-none transition focus:border-[#55ace7] focus:ring-2 focus:ring-[#55ace7]/30 read-only:bg-slate-50'

function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-100 bg-[#f8fbff] px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#246392]"
      />
      <span className="text-sm font-medium text-[#333]">{label}</span>
    </label>
  )
}

export default function MoveStudentModal({
  open,
  onClose,
  student,
  currentBatch,
  targetBatches = [],
  getTargetStrength,
  onSubmit,
  saving = false,
}) {
  const [targetBatchId, setTargetBatchId] = useState('')
  const [transferDate, setTransferDate] = useState('')
  const [reason, setReason] = useState('')
  const [transferAttendance, setTransferAttendance] = useState(true)
  const [transferFee, setTransferFee] = useState(true)
  const [transferTests, setTransferTests] = useState(true)
  const [errors, setErrors] = useState({})

  const eligibleTargets = useMemo(
    () =>
      targetBatches.filter(
        (b) =>
          String(b.id) !== String(currentBatch?.id) &&
          !NON_TRANSFER_TARGET_STATUSES.includes(b.status || ''),
      ),
    [targetBatches, currentBatch?.id],
  )

  const selectedTarget = eligibleTargets.find((b) => String(b.id) === String(targetBatchId))

  const capacityInfo = useMemo(() => {
    if (!selectedTarget) return null
    const strength = getTargetStrength?.(selectedTarget) ?? selectedTarget.totalStudents ?? 0
    const capacity = getBatchCapacity(selectedTarget.apiRow || selectedTarget)
    const available = getAvailableSeats(capacity, strength)
    const check = canTransferToBatch(selectedTarget.apiRow || selectedTarget, strength)
    return { capacity, strength, available, check }
  }, [selectedTarget, getTargetStrength])

  useEffect(() => {
    if (!open) return
    setTargetBatchId('')
    setTransferDate(new Date().toISOString().slice(0, 10))
    setReason('')
    setTransferAttendance(true)
    setTransferFee(true)
    setTransferTests(true)
    setErrors({})
  }, [open, student?.id])

  const canSubmit =
    capacityInfo?.check?.ok &&
    targetBatchId &&
    reason.trim().length >= 3

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!targetBatchId) next.target = 'Select a target batch'
    if (String(targetBatchId) === String(currentBatch?.id)) {
      next.target = 'Cannot move to the same batch'
    }
    if (!transferDate) next.transferDate = 'Transfer date is required'
    if (!reason.trim()) next.reason = 'Transfer reason is required'
    if (capacityInfo && !capacityInfo.check.ok) {
      next.target = capacityInfo.check.reason
    }
    setErrors(next)
    if (Object.keys(next).length) return

    onSubmit?.({
      targetBatchId,
      transferDate,
      reason: reason.trim(),
      transferAttendance,
      transferFee,
      transferTests,
    })
  }

  if (!student || !currentBatch) return null

  return (
    <BatchFormModalShell
      open={open}
      onClose={onClose}
      title="Move Student"
      subtitle={`${student.name} · ${student.enrollmentId}`}
      saving={saving}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-[#444] transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="move-student-form"
            disabled={saving || !canSubmit}
            className={cn(
              'h-11 rounded-xl bg-gradient-to-r from-[#55ace7] to-[#246392] px-8 text-sm font-bold text-white shadow-md',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {saving ? 'Moving…' : 'Move Student'}
          </button>
        </div>
      }
    >
      <form id="move-student-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#686868]">
            Current Batch
          </label>
          <input readOnly value={currentBatch.displayName} className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#686868]">
            Select New Batch <span className="text-red-500">*</span>
          </label>
          <select
            value={targetBatchId}
            onChange={(e) => {
              setTargetBatchId(e.target.value)
              setErrors((x) => ({ ...x, target: undefined }))
            }}
            className={inputClass}
          >
            <option value="">Choose target batch…</option>
            {eligibleTargets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.displayName} ({b.status})
              </option>
            ))}
          </select>
          {errors.target && (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.target}</p>
          )}
        </div>

        {capacityInfo && selectedTarget && (
          <div
            className={cn(
              'rounded-xl p-4 text-sm',
              capacityInfo.available > 0
                ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
            )}
          >
            <p>
              <span className="font-semibold">Capacity:</span> {capacityInfo.capacity}
            </p>
            <p>
              <span className="font-semibold">Current Strength:</span> {capacityInfo.strength}
            </p>
            <p>
              <span className="font-semibold">Available Seats:</span> {capacityInfo.available}
            </p>
            {capacityInfo.available <= 0 && (
              <p className="mt-2 flex items-center gap-2 font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                No seats available — transfer is disabled.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#686868]">
            Effective Transfer Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#686868]">
            Transfer Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={cn(inputClass, 'h-auto min-h-[80px] py-2')}
            placeholder="Reason for transfer…"
          />
          {errors.reason && (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.reason}</p>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-1">
          <CheckboxField
            label="Transfer Attendance Records"
            checked={transferAttendance}
            onChange={setTransferAttendance}
          />
          <CheckboxField
            label="Transfer Fee Records"
            checked={transferFee}
            onChange={setTransferFee}
          />
          <CheckboxField
            label="Transfer Test Records"
            checked={transferTests}
            onChange={setTransferTests}
          />
        </div>
      </form>
    </BatchFormModalShell>
  )
}
