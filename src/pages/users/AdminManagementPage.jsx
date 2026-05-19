import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Shield, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import CreateAdminModal from '../../components/admin-management/CreateAdminModal'
import EditButton from '../../components/common/EditButton'
import { StatusBadge } from '../../components/academics/AcademicsUi'
import { useAdminRoles } from '../../contexts/AdminRolesContext'
import {
  deleteEmployeeByEmail,
  listEmployees,
} from '../../utils/employeeAuthStorage'
import { formatCategoryDateTime } from '../../utils/formatDateTime'

function mapEmployeesToRows(employees, roles) {
  const roleLabels = Object.fromEntries(roles.map((r) => [r.id, r.label]))
  return employees.map((emp) => ({
    id: emp.email,
    accessTitle: roleLabels[emp.role] || emp.role || '—',
    accessCode: emp.employeeId || emp.id || '—',
    status: emp.status === 'inactive' ? 'In Active' : 'Active',
    createdAt: emp.createdAt,
    _raw: emp,
  }))
}

export default function AdminManagementPage() {
  const { roles } = useAdminRoles()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [entries, setEntries] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const refreshEntries = useCallback(() => {
    setEntries(mapEmployeesToRows(listEmployees(), roles))
  }, [roles])

  useEffect(() => {
    refreshEntries()
  }, [refreshEntries])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries
      .filter((row) => {
        const matchSearch =
          !q ||
          row.accessTitle.toLowerCase().includes(q) ||
          row.accessCode.toLowerCase().includes(q)
        const matchStatus = statusFilter === 'all' || row.status === statusFilter
        return matchSearch && matchStatus
      })
      .map((row, index) => ({ ...row, serialNumber: index + 1 }))
  }, [entries, search, statusFilter])

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const openCreate = () => {
    setEditingRecord(null)
    setCreateModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingRecord(row._raw)
    setCreateModalOpen(true)
  }

  const handleCloseModal = () => {
    setCreateModalOpen(false)
    setEditingRecord(null)
  }

  const handleSuccess = () => {
    refreshEntries()
  }

  const handleDelete = (row) => {
    if (
      !window.confirm(
        `Delete user access for "${row.accessTitle}" (${row.accessCode})?`,
      )
    ) {
      return
    }
    deleteEmployeeByEmail(row.id)
    refreshEntries()
    toast.success('User access deleted')
  }

  const columns = [
    {
      key: 'serialNumber',
      label: '#',
      headerClassName: 'w-14 pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10 text-[#686868]',
      render: (row) => row.serialNumber,
    },
    {
      key: 'accessTitle',
      label: 'Access Title',
      headerClassName: 'pl-4',
      cellClassName: 'pl-4 font-medium',
    },
    {
      key: 'accessCode',
      label: 'Access Code',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (row) => (
        <span className="text-[#686868]">{formatCategoryDateTime(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <EditButton onClick={() => openEdit(row)} />
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#c96565] transition hover:text-[#b94b4b] sm:text-base"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.1} />
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-10 pt-6 dark:bg-[var(--app-bg)] sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <PageBanner icon={Shield} title="Admin Management">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:py-2.5"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            Create User Access
          </button>
        </PageBanner>

        <CreateAdminModal
          open={createModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          editingRecord={editingRecord}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <CourseFilterToolbar
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              searchPlaceholder="Search user access"
              status={statusFilter}
              onStatusChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-10 min-h-[38px] shrink-0 rounded-lg border border-[#55ace7]/25 bg-white px-4 text-sm font-semibold text-[#246392] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#eef2fc] sm:text-base"
          >
            Reset
          </button>
        </div>

        <PaginatedFigmaTable
          columns={columns}
          data={filtered}
          emptyMessage="No user access records match your filters."
          itemLabel="user access records"
          resetDeps={[search, statusFilter]}
          rowClassName="hover:bg-slate-50/90"
        />
      </section>
    </div>
  )
}
