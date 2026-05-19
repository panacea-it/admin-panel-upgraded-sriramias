import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, Pencil } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatCard from '../../components/finance/FinanceStatCard'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import EmiEditModal from '../../components/finance/EmiEditModal'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchEmiPlans, updateEmiPlan } from '../../api/financeAPI'
import { formatINR } from '../../utils/financeFilters'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

export default function EmiManagementPage() {
  const { canManageEmi } = useFinancePermissions()
  const [plans, setPlans] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [editPlan, setEditPlan] = useState(null)
  const [installments, setInstallments] = useState([])
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setPlans(await fetchEmiPlans())
    } catch {
      toast.error('Failed to load EMI plans')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return plans
    return plans.filter(
      (p) =>
        p.studentName.toLowerCase().includes(q) ||
        p.courseName.toLowerCase().includes(q) ||
        p.studentId.toLowerCase().includes(q),
    )
  }, [plans, debouncedSearch])

  const summary = useMemo(() => {
    const totalPending = plans.reduce((s, p) => s + (p.pendingAmount || 0), 0)
    const dueCount = plans.reduce(
      (s, p) => s + (p.installments || []).filter((i) => i.status === 'Due' || i.status === 'Overdue').length,
      0,
    )
    return { active: plans.length, totalPending, dueCount }
  }, [plans])

  const openEdit = (plan) => {
    setEditPlan(plan)
    setInstallments(JSON.parse(JSON.stringify(plan.installments)))
  }

  const handleSave = async () => {
    if (!editPlan) return
    setSaving(true)
    try {
      await updateEmiPlan(editPlan.id, installments)
      toast.success('EMI plan updated')
      setEditPlan(null)
      load()
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const planColumns = [
    { key: 'studentName', label: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: 'courseName', label: 'Course' },
    { key: 'totalFees', label: 'Total', render: (r) => formatINR(r.totalFees) },
    { key: 'totalPaid', label: 'Paid', render: (r) => formatINR(r.totalPaid) },
    { key: 'pendingAmount', label: 'Pending', render: (r) => formatINR(r.pendingAmount) },
    {
      key: 'completionPercent',
      label: 'Progress',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-[#55ace7]" style={{ width: `${r.completionPercent}%` }} />
          </div>
          <span className="text-xs font-medium">{r.completionPercent}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (row) =>
        canManageEmi ? (
          <button type="button" onClick={() => openEdit(row)} className="rounded p-1.5 text-[#246392] hover:bg-[#eef6fc]">
            <Pencil className="h-4 w-4" />
          </button>
        ) : null,
    },
  ]

  const installmentRows = editPlan
    ? []
    : filtered.flatMap((p) =>
        (p.installments || []).map((i) => ({
          ...i,
          planId: p.id,
          studentName: p.studentName,
          courseName: p.courseName,
        })),
      )

  const installmentColumns = [
    { key: 'studentName', label: 'Student' },
    { key: 'courseName', label: 'Course' },
    { key: 'emiNo', label: 'EMI #' },
    { key: 'dueDate', label: 'Due' },
    { key: 'emiAmount', label: 'Amount', render: (r) => formatINR(r.emiAmount) },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
  ]

  return (
    <FinancePageShell icon={CalendarClock} title="EMI Management">
      <input
        type="search"
        placeholder="Search student or course…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FinanceStatCard label="Active EMI plans" value={summary.active} />
        <FinanceStatCard label="Total pending" value={formatINR(summary.totalPending)} accent="from-[#efb36d] to-[#b8887a]" />
        <FinanceStatCard label="Due installments" value={summary.dueCount} accent="from-[#df8284] to-[#b8887a]" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#246392]">EMI plans</h3>
        <PaginatedFigmaTable columns={planColumns} data={filtered} itemLabel="plans" resetDeps={[debouncedSearch]} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#246392]">All installments</h3>
        <PaginatedFigmaTable columns={installmentColumns} data={installmentRows} itemLabel="installments" />
      </div>

      <EmiEditModal
        open={!!editPlan}
        plan={editPlan}
        installments={installments}
        onChangeInstallment={(idx, field, val) => {
          setInstallments((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row)))
        }}
        onClose={() => setEditPlan(null)}
        onSave={handleSave}
        saving={saving}
      />
    </FinancePageShell>
  )
}
