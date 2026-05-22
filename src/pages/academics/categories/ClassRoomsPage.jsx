import { useCallback, useEffect, useMemo, useState } from 'react'
import { DoorOpen, PlusCircle } from 'lucide-react'
import CategoryPageHeader from '../../../components/categories/CategoryPageHeader'
import CategoryFilterBar from '../../../components/categories/CategoryFilterBar'
import CategoryStatusBadge from '../../../components/categories/CategoryStatusBadge'
import CategoryTableActions from '../../../components/categories/CategoryTableActions'
import CategoryEmptyState from '../../../components/categories/CategoryEmptyState'
import PaginatedFigmaTable from '../../../components/figma/PaginatedFigmaTable'
import ClassroomFormModal from '../../../components/classrooms/ClassroomFormModal'
import {
  deleteClassroom,
  fetchClassrooms,
  getUsageStats,
  saveClassroom,
  toggleClassroomStatus,
} from '../../../api/classroomsAPI'
import { formatCategoryDateTime } from '../../../utils/formatDateTime'
import { toast } from '../../../utils/toast'

function OccupancyCell({ classroomId }) {
  const stats = getUsageStats(classroomId)
  const pct =
    stats.totalBookings === 0
      ? 0
      : Math.min(100, Math.round((stats.upcomingBookings / Math.max(stats.totalBookings, 1)) * 100))
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-[#246392]">
        {stats.upcomingBookings} upcoming
      </span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#e8f4fc]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#55ace7] to-[#3dad4a]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-[#94a3b8]">{stats.totalBookings} total bookings</span>
    </div>
  )
}

export default function ClassRoomsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ search: '', status: 'all' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchClassrooms()
      setRows(list)
    } catch (e) {
      toast.error(e.message || 'Failed to load classrooms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const onUpdate = () => load()
    window.addEventListener('classrooms-updated', onUpdate)
    window.addEventListener('academics-subjects-updated', onUpdate)
    return () => {
      window.removeEventListener('classrooms-updated', onUpdate)
      window.removeEventListener('academics-subjects-updated', onUpdate)
    }
  }, [load])

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim()
    return rows.filter((row) => {
      const matchSearch =
        !q ||
        row.name?.toLowerCase().includes(q) ||
        row.code?.toLowerCase().includes(q) ||
        row.description?.toLowerCase().includes(q)
      const matchStatus = filters.status === 'all' || row.status === filters.status
      return matchSearch && matchStatus
    })
  }, [rows, filters])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      await saveClassroom(form, { isEdit: Boolean(editRow), id: editRow?.id })
      toast.success(editRow ? 'Classroom updated' : 'Classroom created')
      setModalOpen(false)
      setEditRow(null)
      await load()
    } catch (e) {
      const msg = e.validation
        ? Object.values(e.validation)[0]
        : e.message || 'Save failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return
    try {
      await deleteClassroom(row.id)
      toast.success('Classroom deleted')
      await load()
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    }
  }

  const handleToggle = async (row) => {
    try {
      await toggleClassroomStatus(row.id)
      toast.success(row.status === 'Active' ? 'Classroom disabled' : 'Classroom enabled')
      await load()
    } catch (e) {
      toast.error(e.message || 'Status update failed')
    }
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (row) => (
        <span className="font-mono text-sm font-semibold text-[#246392]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Classroom Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: row.color || '#246392' }}
          />
          <span className="font-medium text-[#1a3a5c]">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (row) => (
        <span className="text-sm text-[#444]">{row.capacity != null ? row.capacity : '—'}</span>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      render: (row) => <OccupancyCell classroomId={row.id} />,
    },
    {
      key: 'createdAt',
      label: 'Added On',
      render: (row) => (
        <span className="text-sm text-[#64748b]">{formatCategoryDateTime(row.createdAt)}</span>
      ),
    },
    {
      key: 'modifiedAt',
      label: 'Modified On',
      render: (row) => (
        <span className="text-sm text-[#64748b]">{formatCategoryDateTime(row.modifiedAt)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <CategoryStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <CategoryTableActions
          status={row.status}
          onView={() => toast.info(`${row.name} — ${row.description || 'No description'}`)}
          onEdit={() => {
            setEditRow(row)
            setModalOpen(true)
          }}
          onToggleStatus={() => handleToggle(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ]

  return (
    <>
      <CategoryPageHeader
        icon={DoorOpen}
        title="Class Rooms"
        subtitle="Manage physical classrooms for live sessions"
      >
        <button
          type="button"
          onClick={() => {
            setEditRow(null)
            setModalOpen(true)
          }}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4" />
          Add Classroom
        </button>
      </CategoryPageHeader>

      <CategoryFilterBar
        search={filters.search}
        onSearchChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        searchPlaceholder="Search classrooms..."
        status={filters.status}
        onStatusChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
      />

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-[#e8f4fc] bg-white p-4 shadow-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-gradient-to-r from-[#eef6fc] via-[#f8fafc] to-[#eef6fc]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <CategoryEmptyState
          title="No Classrooms Found"
          description="Add classrooms to assign them to live classes and prevent scheduling conflicts."
          ctaLabel="Add Classroom"
          onCta={() => {
            setEditRow(null)
            setModalOpen(true)
          }}
        />
      ) : (
        <PaginatedFigmaTable
          data={filtered}
          columns={columns}
          itemLabel="classrooms"
        />
      )}

      <ClassroomFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditRow(null)
        }}
        classroom={editRow}
        onSave={handleSave}
        saving={saving}
      />
    </>
  )
}
