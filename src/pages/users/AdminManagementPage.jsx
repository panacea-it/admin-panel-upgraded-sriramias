import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, Plus, Shield, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import CreateAdminModal from '../../components/admin-management/CreateAdminModal'
import ViewAdminDrawer from '../../components/admin-management/ViewAdminDrawer'
import EditButton from '../../components/common/EditButton'
import { useTableRowSelection } from '../../hooks/useTableRowSelection'
import { StatusBadge } from '../../components/academics/AcademicsUi'
import { useAdminRoles } from '../../contexts/AdminRolesContext'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import {
  deleteEmployeeByEmail,
  listEmployees,
  saveEmployeeAccount,
} from '../../utils/employeeAuthStorage'
import { EMPLOYEES_UPDATED_EVENT } from '../../utils/mentorEmployees'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { cn } from '../../utils/cn'

function mapEmployeesToRows(employees, roles) {
  const roleLabels = Object.fromEntries(roles.map((r) => [r.id, r.label]))
  return employees.map((emp) => ({
    id: emp.email,
    employeeName: emp.name || emp.fullName || '—',
    employeeId: emp.employeeId || emp.id || '—',
    roleId: emp.role || '',
    roleTitle: roleLabels[emp.role] || emp.role || '—',
    status: emp.status === 'inactive' ? 'In Active' : 'Active',
    createdAt: emp.createdAt,
    _raw: emp,
  }))
}

export default function AdminManagementPage() {
  const { roles } = useAdminRoles()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [viewingRecord, setViewingRecord] = useState(null)
  const { selection, clearSelection } = useTableRowSelection((row) => row.id)
  const [entries, setEntries] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const debouncedSearch = useDebouncedValue(search)

  const refreshEntries = useCallback(() => {
    setEntries(mapEmployeesToRows(listEmployees(), roles))
  }, [roles])

  useEffect(() => {
    refreshEntries()
  }, [refreshEntries])

  useEffect(() => {
    const onEmployeesUpdated = () => refreshEntries()
    window.addEventListener(EMPLOYEES_UPDATED_EVENT, onEmployeesUpdated)
    return () => window.removeEventListener(EMPLOYEES_UPDATED_EVENT, onEmployeesUpdated)
  }, [refreshEntries])

  const roleFilterOptions = useMemo(() => {
    const titles = new Set(entries.map((row) => row.roleTitle).filter((t) => t && t !== '—'))
    const sorted = [...titles].sort((a, b) => a.localeCompare(b))
    return [
      { value: 'all', label: 'All Roles' },
      ...sorted.map((title) => ({ value: title, label: title })),
    ]
  }, [entries])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return entries.filter((row) => {
      const matchSearch =
        !q ||
        row.employeeName.toLowerCase().includes(q) ||
        row.employeeId.toLowerCase().includes(q)
      const matchRole = roleFilter === 'all' || row.roleTitle === roleFilter
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [entries, debouncedSearch, roleFilter, statusFilter])

  const handleResetFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
    clearSelection()
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
        `Delete user access for "${row.employeeName}" (${row.employeeId})?`,
      )
    ) {
      return
    }
    deleteEmployeeByEmail(row.id)
    refreshEntries()
    toast.success('User access deleted')
  }

  const handleStatusToggle = useCallback(
    (row) => {
      const emp = row._raw
      const nextStatus = emp.status === 'inactive' ? 'active' : 'inactive'
      saveEmployeeAccount({
        ...emp,
        status: nextStatus,
      })
      refreshEntries()
      toast.success(
        nextStatus === 'active' ? 'Employee marked active' : 'Employee marked inactive',
      )
    },
    [refreshEntries],
  )

  const columns = useMemo(
    () => [
      {
        key: 'employeeName',
        label: 'Employee Name',
        headerClassName: 'pl-6 sm:pl-10',
        cellClassName: 'pl-6 sm:pl-10 font-medium',
      },
      {
        key: 'employeeId',
        label: 'Employee Number / Employee ID',
      },
      {
        key: 'roleTitle',
        label: 'Role Title',
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <button
            type="button"
            onClick={() => handleStatusToggle(row)}
            className={cn('rounded-md transition hover:opacity-90')}
            title="Click to change status"
          >
            <StatusBadge status={row.status} />
          </button>
        ),
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
          <div className="flex flex-nowrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setViewingRecord(row._raw)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#686868] transition hover:text-[#246392] sm:text-base"
            >
              <Eye className="h-4 w-4" strokeWidth={2.2} />
              View
            </button>
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
    ],
    [handleStatusToggle],
  )

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-10 pt-6 sm:px-5 lg:px-6">
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

        <ViewAdminDrawer
          open={!!viewingRecord}
          employee={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <CourseFilterToolbar
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              searchPlaceholder="Search by employee name or employee ID"
              category={roleFilter}
              onCategoryChange={(e) => setRoleFilter(e.target.value)}
              categoryOptions={roleFilterOptions}
              categoryAriaLabel="Role Title"
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
          emptyMessage="No employees found"
          itemLabel="employees"
          resetDeps={[debouncedSearch, roleFilter, statusFilter]}
          rowClassName="hover:bg-slate-50/90"
          selection={selection}
        />
      </section>
    </div>
  )
}
