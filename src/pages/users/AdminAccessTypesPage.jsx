import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Shield, Trash2, Pencil, Plus } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import { useAdminRoles } from '../../contexts/AdminRolesContext'
import AdminRoleFormModal from '../../components/admin-management/roles/AdminRoleFormModal'
import Switch from '../../components/admin-management/ui/Switch'
import { cn } from '../../utils/cn'
import { adminRoleIconMap } from '../../utils/adminRoleIcons'
import { PERMISSION_MODULES, SECURITY_BADGES } from '../../data/adminManagementConfig'

function ActionBullets({ actions }) {
  const items = [
    { k: 'view', label: 'View', on: !!actions.view },
    { k: 'edit', label: 'Edit', on: !!actions.edit },
    { k: 'delete', label: 'Delete', on: !!actions.delete },
    { k: 'disable', label: 'Disable', on: !!actions.disable },
  ]
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((x) => (
        <li
          key={x.k}
          className={cn(
            'inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset',
            x.on
              ? 'bg-emerald-500/10 text-emerald-800 ring-emerald-500/25 dark:bg-emerald-950/35 dark:text-emerald-300'
              : 'bg-slate-200/70 text-slate-500 ring-slate-300/70 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700',
          )}
        >
          {x.on ? '✓' : '✗'} {x.label}
        </li>
      ))}
    </ul>
  )
}

export default function AdminAccessTypesPage() {
  const {
    roles,
    matrixRoles,
    deleteRole,
    setRoleEnabled,
  } = useAdminRoles()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (roleToEdit) => {
    setEditing(roleToEdit)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = (role) => {
    if (!window.confirm(`Delete access type "${role.label}"? This removes its RBAC rows from stored permissions.`))
      return
    const ok = deleteRole(role.id)
    if (!ok) {
      toast.error('Cannot delete this role')
      return
    }
    toast.success('Access type deleted')
  }

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-12 pt-6 dark:bg-[var(--app-bg)] sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-8">
        <PageBanner icon={Shield} title="Admin Access Types">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              to="/users/role-matrix"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <LayoutGrid className="h-4 w-4" />
              Open matrix
            </Link>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Create access type
            </button>
          </div>
        </PageBanner>

        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Define IAM-style admin titles, lifecycle (enable/disable), role action permissions (view/edit/delete/disable),
          and module baselines. Feature-level granularity is configured in the{' '}
          <Link className="font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-400" to="/users/role-matrix">
            Role Access Matrix
          </Link>
          .
        </p>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {matrixRoles.map((role) => {
            const Icon = adminRoleIconMap[role.iconKey] || Shield
            const badge = SECURITY_BADGES[role.securityLevel] || SECURITY_BADGES.medium
            return (
              <motion.article
                layout
                key={role.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900/60',
                  !role.enabled && 'opacity-90 grayscale-[0.2]',
                )}
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:from-violet-500/12 dark:to-fuchsia-500/10 dark:text-violet-400">
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{role.label}</h2>
                        {role.fullAccess ? (
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-400">
                            System
                          </span>
                        ) : null}
                        {!role.enabled ? (
                          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            Disabled
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{role.id}</p>
                      <span
                        className={cn(
                          'inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
                          badge.className,
                        )}
                      >
                        {badge.label} risk
                      </span>
                    </div>
                  </div>

                  {!role.systemProtected ? (
                    <Switch
                      id={`enabled-${role.id}`}
                      label=""
                      checked={role.enabled}
                      onChange={(v) => setRoleEnabled(role.id, v)}
                      description={role.enabled ? 'Active assignments' : 'Blocked from assignments'}
                      relaxed={false}
                    />
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Always on</span>
                  )}
                </div>

                <div className="flex flex-1 flex-col px-6 py-5">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{role.description}</p>

                  <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      Role actions — resource lifecycle
                    </p>
                    <ActionBullets actions={role.roleActions} />
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      Module baseline
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {PERMISSION_MODULES.map((m) => (
                        <span
                          key={m.id}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
                            role.legacyModuleMatrix?.[m.id]
                              ? 'bg-violet-500/12 text-violet-800 ring-violet-500/25 dark:text-violet-200'
                              : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700',
                          )}
                        >
                          {role.legacyModuleMatrix?.[m.id] ? 'On' : 'Off'} · {m.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => openEdit(roles.find((r) => r.id === role.id))}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-violet-200 hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:flex-none min-[400px]:px-4"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <Link
                      to={`/users/role-matrix?focus=${encodeURIComponent(role.id)}`}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md sm:flex-none min-[400px]:px-4"
                    >
                      Permissions
                    </Link>
                    <button
                      type="button"
                      disabled={role.systemProtected || role.fullAccess}
                      onClick={() => handleDelete(role)}
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-35 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden min-[460px]:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      <AdminRoleFormModal open={formOpen} initialRole={editing} onClose={handleCloseForm} />
    </div>
  )
}
