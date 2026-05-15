import { useMemo, useState } from 'react'
import {
  Ban,
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import PageBanner from '../../components/figma/PageBanner'
import CenterFormDrawer from '../../components/center-management/CenterFormDrawer'
import ViewCenterDrawer from '../../components/center-management/ViewCenterDrawer'
import ConfirmCenterDeleteModal from '../../components/center-management/ConfirmCenterDeleteModal'
import { useCenters } from '../../contexts/CentersContext'
import { cn } from '../../utils/cn'

function StatusPill({ status }) {
  const active = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex min-w-[92px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset',
        active
          ? 'bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200'
          : 'bg-amber-500/15 text-amber-900 ring-amber-500/25 dark:text-amber-100',
      )}
    >
      {active ? 'Active' : 'Disabled'}
    </span>
  )
}

export default function CenterManagementPage() {
  const {
    centers,
    createCenter,
    updateCenter,
    setCenterDisabled,
    deleteCenter,
  } = useCenters()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return centers.filter((c) => {
      if (statusFilter === 'active' && c.status !== 'active') return false
      if (statusFilter === 'disabled' && c.status !== 'disabled') return false
      if (!q) return true
      const hay = [
        c.centerName,
        c.centerCode,
        c.city,
        c.state,
        c.email,
        ...(c.assignedAdmins || []),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [centers, query, statusFilter])

  const openCreate = () => {
    setFormMode('create')
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setFormMode('edit')
    setEditing(row)
    setFormOpen(true)
  }

  const handleDisableToggle = (row) => {
    const disable = row.status === 'active'
    setCenterDisabled(row.centerId, disable)
    toast.success(disable ? 'Center disabled' : 'Center enabled')
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const res = deleteCenter(deleteTarget.centerId)
    setDeleteLoading(false)
    if (!res.ok) {
      toast.error(res.reason || 'Unable to delete center')
      return
    }
    toast.success('Center deleted')
    setDeleteTarget(null)
  }

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-10 pt-6 dark:bg-[var(--app-bg)] sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-6 sm:space-y-8">
        <PageBanner icon={Building2} title="Center Management">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:py-2.5"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            Create Center
          </button>
        </PageBanner>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search centers by name, code, city, admin…"
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/80 py-2.5 pl-10 pr-3 text-[13px] font-medium text-slate-900 outline-none ring-violet-500/0 transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/15 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'disabled', label: 'Disabled' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStatusFilter(t.id)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-[12px] font-bold uppercase tracking-wide transition',
                    statusFilter === t.id
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="min-w-[880px] w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                  <th className="whitespace-nowrap px-4 py-3">Center</th>
                  <th className="whitespace-nowrap px-4 py-3">City</th>
                  <th className="whitespace-nowrap px-4 py-3">State</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                  <th className="whitespace-nowrap px-4 py-3">Assigned admins</th>
                  <th className="whitespace-nowrap px-4 py-3">Created</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((row) => (
                  <tr
                    key={row.centerId}
                    className="bg-white transition hover:bg-violet-50/40 dark:bg-slate-950 dark:hover:bg-slate-900/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {row.centerName}
                      </div>
                      <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        Code: {row.centerCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {row.city || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {row.state || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-[12px] font-semibold text-violet-800 ring-1 ring-violet-500/15 dark:bg-violet-950/40 dark:text-violet-100">
                        <UserCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {row.assignedAdmins?.length ?? 0}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewing(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDisableToggle(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          {row.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200/90 bg-rose-50 px-2.5 py-1.5 text-[12px] font-semibold text-rose-800 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="px-6 py-14 text-center text-[14px] font-semibold text-slate-500 dark:text-slate-400">
                No centers match your filters.
              </div>
            )}
          </div>
        </div>
      </section>

      <CenterFormDrawer
        open={formOpen}
        mode={formMode}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onCreate={createCenter}
        onUpdate={updateCenter}
      />

      <ViewCenterDrawer open={!!viewing} center={viewing} onClose={() => setViewing(null)} />

      <ConfirmCenterDeleteModal
        open={!!deleteTarget}
        centerName={deleteTarget?.centerName}
        loading={deleteLoading}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
