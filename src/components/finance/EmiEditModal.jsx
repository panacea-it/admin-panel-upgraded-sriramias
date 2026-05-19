import { useState, useEffect } from 'react'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import { formatINR } from '../../utils/financeFilters'
import { cn } from '../../utils/cn'

const emptyInstallment = (no) => ({
  emiNo: no,
  emiDate: '',
  emiAmount: '',
  status: 'Due',
  dueDate: '',
  paidDate: '',
  paymentMode: '',
  receipt: null,
})

export default function EmiEditModal({ open, onClose, plan, onSubmit }) {
  const [installments, setInstallments] = useState([])
  const isEdit = Boolean(plan?.id)

  useEffect(() => {
    if (!open) return
    if (plan?.installments?.length) {
      setInstallments(
        plan.installments.map((emi) => ({
          ...emi,
          emiAmount: String(emi.emiAmount ?? ''),
        })),
      )
    } else {
      setInstallments([emptyInstallment(1)])
    }
  }, [open, plan])

  const updateRow = (index, key, value) => {
    setInstallments((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    )
  }

  const addRow = () => {
    setInstallments((rows) => [...rows, emptyInstallment(rows.length + 1)])
  }

  const removeRow = (index) => {
    setInstallments((rows) =>
      rows
        .filter((_, i) => i !== index)
        .map((row, i) => ({ ...row, emiNo: i + 1 })),
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = installments.map((emi) => ({
      ...emi,
      emiAmount: Number(emi.emiAmount) || 0,
      emiNo: Number(emi.emiNo),
    }))
    onSubmit?.(payload, { planId: plan?.id, isEdit })
  }

  const handleReset = () => {
    if (plan?.installments) {
      setInstallments(
        plan.installments.map((emi) => ({
          ...emi,
          emiAmount: String(emi.emiAmount ?? ''),
        })),
      )
    } else {
      setInstallments([emptyInstallment(1)])
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="xl" title={isEdit ? 'Edit EMI Plan' : 'Add EMI Installments'}>
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader
          title={isEdit ? 'Edit EMI Installments' : 'Add EMI Installments'}
          onBack={onClose}
          icon={CalendarClock}
          iconClassName="text-[#246392]"
        />

        <div className="space-y-4 p-5 sm:p-6">
          {plan && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <p className="font-bold text-[#222]">{plan.studentName}</p>
              <p className="text-[#686868]">{plan.courseName}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#246392]">
                <span>Total: {formatINR(plan.totalFees)}</span>
                <span>Paid: {formatINR(plan.totalPaid)}</span>
                <span>Pending: {formatINR(plan.pendingAmount)}</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gradient-to-r from-[#55ace7] to-[#246392] text-xs font-semibold text-white">
                <tr>
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Due Date</th>
                  <th className="px-2 py-2">Amount (₹)</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Paid Date</th>
                  <th className="px-2 py-2">Mode</th>
                  <th className="px-2 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {installments.map((emi, index) => (
                  <tr key={emi.emiNo} className="border-t border-slate-100">
                    <td className="px-2 py-2 font-semibold text-[#246392]">{emi.emiNo}</td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={emi.dueDate || emi.emiDate || ''}
                        onChange={(e) => {
                          updateRow(index, 'dueDate', e.target.value)
                          updateRow(index, 'emiDate', e.target.value)
                        }}
                        className="h-9 w-full min-w-[120px] rounded border border-slate-200 px-2 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={emi.emiAmount}
                        onChange={(e) => updateRow(index, 'emiAmount', e.target.value)}
                        className="h-9 w-full min-w-[100px] rounded border border-slate-200 px-2 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={emi.status}
                        onChange={(e) => updateRow(index, 'status', e.target.value)}
                        className="h-9 w-full min-w-[100px] rounded border border-slate-200 px-2 text-sm"
                      >
                        {['Due', 'Paid', 'Overdue', 'Pending'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={emi.paidDate || ''}
                        onChange={(e) => updateRow(index, 'paidDate', e.target.value)}
                        className="h-9 w-full min-w-[120px] rounded border border-slate-200 px-2 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={emi.paymentMode || ''}
                        onChange={(e) => updateRow(index, 'paymentMode', e.target.value)}
                        placeholder="UPI, Cash…"
                        className="h-9 w-full min-w-[90px] rounded border border-slate-200 px-2 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={installments.length <= 1}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg text-[#df8284] transition hover:bg-red-50',
                          installments.length <= 1 && 'cursor-not-allowed opacity-40',
                        )}
                        aria-label="Remove installment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#55ace7] px-4 py-2 text-sm font-semibold text-[#246392] hover:bg-[#eef2fc]"
            >
              <Plus className="h-4 w-4" />
              Add Installment
            </button>
            {plan?.completionPercent != null && (
              <span className="text-sm font-semibold text-[#246392]">
                Completion: {plan.completionPercent}%
              </span>
            )}
          </div>

          <FormModalSubmitBar
            isEditMode={isEdit}
            createLabel="Save EMI Plan"
            updateLabel="Update EMI Plan"
            onReset={handleReset}
          />
        </div>
      </form>
    </Modal>
  )
}
