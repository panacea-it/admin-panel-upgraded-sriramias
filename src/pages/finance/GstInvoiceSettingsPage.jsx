import { useCallback, useEffect, useState } from 'react'
import { Settings2, Save } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import { fetchGstSettings, updateGstSettings } from '../../api/financeAPI'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

export default function GstInvoiceSettingsPage() {
  const { canManageGst } = useFinancePermissions()
  const [form, setForm] = useState({
    gstPercent: 18,
    invoicePrefix: '',
    receiptPrefix: '',
    taxEnabled: true,
    branchGst: [],
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await fetchGstSettings()
      setForm(data)
    } catch {
      toast.error('Failed to load GST settings')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!canManageGst) {
      toast.error('Not permitted to edit GST settings')
      return
    }
    setSaving(true)
    try {
      await updateGstSettings(form)
      toast.success('GST settings saved')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const updateBranch = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      branchGst: prev.branchGst.map((b, i) => (i === idx ? { ...b, [field]: value } : b)),
    }))
  }

  return (
    <FinancePageShell
      icon={Settings2}
      title="GST & Invoice Settings"
      actions={
        canManageGst && (
          <button
            type="submit"
            form="gst-form"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1a3a5c] px-4 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        )
      }
    >
      <form id="gst-form" onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-sm font-bold text-[#246392]">Global tax settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              GST percent
              <input
                type="number"
                disabled={!canManageGst}
                value={form.gstPercent}
                onChange={(e) => setForm((f) => ({ ...f, gstPercent: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
              />
            </label>
            <label className="block text-sm font-medium">
              Invoice prefix
              <input
                disabled={!canManageGst}
                value={form.invoicePrefix}
                onChange={(e) => setForm((f) => ({ ...f, invoicePrefix: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
              />
            </label>
            <label className="block text-sm font-medium">
              Receipt prefix
              <input
                disabled={!canManageGst}
                value={form.receiptPrefix}
                onChange={(e) => setForm((f) => ({ ...f, receiptPrefix: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
              />
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm font-medium">
              <input
                type="checkbox"
                disabled={!canManageGst}
                checked={form.taxEnabled}
                onChange={(e) => setForm((f) => ({ ...f, taxEnabled: e.target.checked }))}
              />
              Enable tax on invoices
            </label>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-sm font-bold text-[#246392]">Branch GST numbers</h3>
          <div className="space-y-4">
            {(form.branchGst || []).map((branch, idx) => (
              <div key={branch.branchId} className="grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-3">
                <p className="font-semibold text-[#111] sm:col-span-3">{branch.branchName}</p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={!canManageGst}
                    checked={branch.gstEnabled}
                    onChange={(e) => updateBranch(idx, 'gstEnabled', e.target.checked)}
                  />
                  GST enabled
                </label>
                <label className="block text-sm font-medium sm:col-span-2">
                  GSTIN
                  <input
                    disabled={!canManageGst}
                    value={branch.gstNumber}
                    onChange={(e) => updateBranch(idx, 'gstNumber', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </form>
    </FinancePageShell>
  )
}
