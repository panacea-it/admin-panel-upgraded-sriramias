import { useCallback, useMemo, useState } from 'react'
import { Eye, LayoutGrid, Pencil, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import CategoryBreadcrumb from '../../components/categories/CategoryBreadcrumb'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import { BannerButton, StatusBadge } from '../../components/academics/AcademicsUi'
import AdminRoleFormModal from '../../components/admin-management/roles/AdminRoleFormModal'
import AdminRoleViewModal from '../../components/admin-management/roles/AdminRoleViewModal'
import ConfirmRoleDeleteModal from '../../components/admin-management/roles/ConfirmRoleDeleteModal'
import { useAdminRoles } from '../../contexts/AdminRolesContext'
import { useTableRowSelection } from '../../hooks/useTableRowSelection'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { cn } from '../../utils/cn'

const BREADCRUMB = [
  { label: 'Admin Management' },
  { label: 'Role Access' },
]

function displayRoleCode(id) {
  return String(id || '')
    .trim()
    .replace(/-/g, '_')
    .toUpperCase()
}

function roleStatus(role) {
  return role.enabled ? 'Active' : 'In Active'
}

function RoleAccessTableActions({ onView, onEdit, onDelete, canDelete }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onView}
        title="View"
        aria-label="View"
        className="inline-flex items-center justify-center rounded-md p-1.5 text-[#686868] transition hover:bg-slate-100 hover:text-[#246392]"
      >
        <Eye className="h-4 w-4" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        aria-label="Edit"
        className="inline-flex items-center justify-center rounded-md p-1.5 text-[#686868] transition hover:bg-slate-100 hover:text-[#246392]"
      >
        <Pencil className="h-4 w-4" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete}
        title="Delete"
        aria-label="Delete"
        className={cn(
          'inline-flex items-center justify-center rounded-md p-1.5 text-[#c96565] transition hover:bg-red-50 hover:text-[#b94b4b]',
          !canDelete && 'cursor-not-allowed opacity-40 hover:bg-transparent',
        )}
      >
        <Trash2 className="h-4 w-4" strokeWidth={2.1} />
      </button>
    </div>
  )
}

export default function RoleAccessPage() {
  const { roles, deleteRole, setRoleEnabled } = useAdminRoles()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { selection, clearSelection } = useTableRowSelection((row) => row.id)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return roles.filter((role) => {
      const code = displayRoleCode(role.id)
      const matchSearch =
        !q ||
        role.label.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        role.id.toLowerCase().includes(q)
      const status = roleStatus(role)
      const matchStatus = statusFilter === 'all' || status === statusFilter
      return matchSearch && matchStatus
    })
  }, [roles, search, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (role) => {
    setEditing(role)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    const ok = deleteRole(deleteTarget.id)
    setDeleteLoading(false)
    if (!ok) {
      toast.error('Cannot delete this role')
      return
    }
    toast.success('Role deleted')
    setDeleteTarget(null)
  }

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    clearSelection()
  }

  const handleStatusToggle = useCallback(
    (row) => {
      if (row.systemProtected || row.fullAccess) return
      const nextEnabled = !row.enabled
      setRoleEnabled(row.id, nextEnabled)
      toast.success(nextEnabled ? 'Role marked active' : 'Role marked inactive')
    },
    [setRoleEnabled],
  )

  const columns = useMemo(
    () => [
      {
        key: 'num',
        label: '#',
        headerClassName: 'w-14 pl-6 sm:pl-10',
        cellClassName: 'pl-6 sm:pl-10 text-[#686868]',
        render: (row) => {
          const index = filtered.findIndex((r) => r.id === row.id)
          return index >= 0 ? index + 1 : '—'
        },
      },
      {
        key: 'label',
        label: 'Role Title (Display)',
        render: (row) => <span className="font-medium">{row.label}</span>,
      },
      {
        key: 'code',
        label: 'Role Code',
        render: (row) => (
          <span className="font-mono text-sm tracking-wide text-[#246392]">
            {displayRoleCode(row.id)}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => {
          const status = roleStatus(row)
          const canToggle = !row.systemProtected && !row.fullAccess
          return (
            <button
              type="button"
              disabled={!canToggle}
              onClick={() => handleStatusToggle(row)}
              className={cn(
                'rounded-md transition',
                canToggle && 'hover:opacity-90',
                !canToggle && 'cursor-default',
              )}
              title={canToggle ? 'Click to toggle status' : undefined}
            >
              <StatusBadge status={status} />
            </button>
          )
        },
      },
      {
        key: 'createdAt',
        label: 'Created On',
        render: (row) => (
          <span className="whitespace-nowrap text-[#686868]">
            {formatCategoryDateTime(row.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <RoleAccessTableActions
            onView={() => setViewing(roles.find((r) => r.id === row.id) || row)}
            onEdit={() => openEdit(roles.find((r) => r.id === row.id) || row)}
            onDelete={() => setDeleteTarget(row)}
            canDelete={!row.systemProtected && !row.fullAccess}
          />
        ),
      },
    ],
    [filtered, roles, handleStatusToggle],
  )

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <CategoryBreadcrumb items={BREADCRUMB} />

        <PageBanner
          icon={LayoutGrid}
          iconClassName="text-[#246392]"
          title="Role Access"
          className="from-[#55ace7] via-[#8b98bb] to-[#df8284]"
        >
          <BannerButton onClick={openCreate}>Create Role Access</BannerButton>
        </PageBanner>

        <div className="flex min-h-14 flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <CourseFilterToolbar
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              searchPlaceholder="Search roles"
              status={statusFilter}
              onStatusChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-10 shrink-0 rounded-lg border border-[#d5dae8] bg-white px-4 text-sm font-semibold text-[#246392] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#eef2fc] sm:text-base"
          >
            Reset filter
          </button>
        </div>

        <PaginatedFigmaTable
          columns={columns}
          data={filtered}
          emptyMessage="No roles match your filters."
          itemLabel="roles"
          resetDeps={[search, statusFilter]}
          rowClassName="hover:bg-slate-50/90"
          selection={selection}
        />
      </section>

      <AdminRoleFormModal open={formOpen} initialRole={editing} onClose={handleCloseForm} />
      <AdminRoleViewModal open={!!viewing} role={viewing} onClose={() => setViewing(null)} />
      <ConfirmRoleDeleteModal
        open={!!deleteTarget}
        roleLabel={deleteTarget?.label}
        loading={deleteLoading}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
