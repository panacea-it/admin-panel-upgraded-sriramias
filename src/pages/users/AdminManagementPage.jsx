import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IdCard, LayoutGrid, Plus, Shield } from 'lucide-react'
import PageBanner from '../../components/figma/PageBanner'
import CreateAdminModal from '../../components/admin-management/CreateAdminModal'
import ActivityTimeline from '../../components/admin-management/ActivityTimeline'
import { cn } from '../../utils/cn'

function HubCard({ to, icon: Icon, title, subtitle, gradient }) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/65',
        gradient,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:bg-violet-950/50 dark:text-violet-300">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p>
          <span className="mt-3 inline-flex items-center text-sm font-semibold text-violet-600 transition group-hover:text-fuchsia-600 dark:text-violet-400">
            Open →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function AdminManagementPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-10 pt-6 dark:bg-[var(--app-bg)] sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-8 sm:space-y-10">
        <PageBanner icon={Shield} title="Admin Management">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:py-2.5"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            Create Admin Access
          </button>
        </PageBanner>

        <CreateAdminModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

        <div className="grid gap-5 md:grid-cols-2">
          <HubCard
            to="/users/admin-access-types"
            icon={IdCard}
            title="Admin Access Types"
            subtitle="Create titles, lifecycle rules, IAM-style role actions, and module baselines — no hard-coded catalog."
            gradient="hover:border-violet-200/90 dark:hover:border-violet-800/70"
          />
          <HubCard
            to="/users/role-matrix"
            icon={LayoutGrid}
            title="Role Access Matrix"
            subtitle="Tune module + feature booleans across every managed access type. Export combined payloads for persistence."
            gradient="hover:border-fuchsia-200/90 dark:hover:border-fuchsia-900/50"
          />
        </div>

        <ActivityTimeline />
      </section>
    </div>
  )
}
