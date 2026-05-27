import { useCallback, useEffect, useMemo, useState } from 'react'
import { DoorOpen, PlusCircle } from 'lucide-react'
import CategoryPageHeader from '../../../components/categories/CategoryPageHeader'
import CategoryFilterBar from '../../../components/categories/CategoryFilterBar'
import CategoryEmptyState from '../../../components/categories/CategoryEmptyState'
import PaginatedFigmaTable from '../../../components/figma/PaginatedFigmaTable'
import ClassroomFormModal from '../../../components/classrooms/ClassroomFormModal'
import { buildClassroomTableColumns } from '../../../components/classrooms/ClassroomTable'
import {
  deleteClassroom,
  fetchClassrooms,
  saveClassroom,
  toggleClassroomStatus,
} from '../../../api/classroomsAPI'
import { useCenters } from '../../../contexts/CentersContext'
import { normalizeClassroomStatus } from '../../../utils/classroomsStorage'
import { toast } from '../../../utils/toast'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

export default function ClassRoomsPage() {
  const { activeCenters } = useCenters()
  const centreList = Array.isArray(activeCenters) ? activeCenters : []
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ search: '', status: 'all', center: 'all' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState(null)

  const centerOptions = useMemo(
    () => [
      { value: 'all', label: 'Center' },
      ...centreList.map((c) => ({
        value: String(c.centerId),
        label: c.centerName,
      })),
    ],
    [centreList],
  )

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
    window.addEventListener('cities-updated', onUpdate)
    window.addEventListener('academics-subjects-updated', onUpdate)
    return () => {
      window.removeEventListener('classrooms-updated', onUpdate)
      window.removeEventListener('cities-updated', onUpdate)
      window.removeEventListener('academics-subjects-updated', onUpdate)
    }
  }, [load])

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim()
    return rows.filter((row) => {
      const rowStatus = normalizeClassroomStatus(row.status)
      const matchSearch =
        !q ||
        row.name?.toLowerCase().includes(q) ||
        row.code?.toLowerCase().includes(q) ||
        row.centerName?.toLowerCase().includes(q) ||
        row.placeName?.toLowerCase().includes(q) ||
        row.description?.toLowerCase().includes(q)
      const matchStatus = filters.status === 'all' || rowStatus === filters.status
      const matchCenter =
        filters.center === 'all' || String(row.centerId) === String(filters.center)
      return matchSearch && matchStatus && matchCenter
    })
  }, [rows, filters])

  const mergeSavedRow = useCallback((saved) => {
    if (!saved?.id) return
    setRows((prev) => {
      const exists = prev.some((r) => r.id === saved.id)
      if (exists) return prev.map((r) => (r.id === saved.id ? saved : r))
      return [saved, ...prev]
    })
  }, [])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const saved = await saveClassroom(form, { isEdit: Boolean(editRow), id: editRow?.id })
      mergeSavedRow(saved)
      toast.success(editRow ? 'Classroom updated' : 'Classroom created')
      setModalOpen(false)
      setEditRow(null)
      if (!editRow && saved?.centerId) {
        setFilters((f) => ({
          ...f,
          search: '',
          center: String(saved.centerId),
        }))
      }
      await load()
    } catch (e) {
      const msg = e.validation
        ? Object.values(e.validation)[0]
        : e.message || 'Save failed'
      toast.error(msg)
      throw e
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return
    try {
      await deleteClassroom(row.id)
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      toast.success('Classroom deleted')
      await load()
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    }
  }, [load])

  const handleToggle = useCallback(
    async (row) => {
      try {
        const saved = await toggleClassroomStatus(row.id)
        mergeSavedRow(saved)
        toast.success(
          normalizeClassroomStatus(row.status) === 'Active'
            ? 'Classroom disabled'
            : 'Classroom enabled',
        )
        await load()
      } catch (e) {
        toast.error(e.message || 'Status update failed')
      }
    },
    [load, mergeSavedRow],
  )

  const handleView = useCallback((row) => {
    const location = [row.centerName, row.placeName].filter(Boolean).join(' · ')
    toast.info(
      location
        ? `${row.name} — ${location}${row.description ? ` — ${row.description}` : ''}`
        : `${row.name} — ${row.description || 'No description'}`,
    )
  }, [])

  const handleEdit = useCallback((row) => {
    setEditRow(row)
    setModalOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      buildClassroomTableColumns({
        onView: handleView,
        onEdit: handleEdit,
        onToggle: handleToggle,
        onDelete: handleDelete,
      }),
    [handleView, handleEdit, handleToggle, handleDelete],
  )

  const showEmpty = !loading && rows.length === 0
  const showNoResults = !loading && rows.length > 0 && filtered.length === 0

  return (
    <div className="space-y-5 sm:space-y-6">
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
        statusOptions={STATUS_OPTIONS}
        centerFilter={filters.center}
        onCenterFilterChange={(e) => setFilters((f) => ({ ...f, center: e.target.value }))}
        centerOptions={centerOptions}
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
      ) : showEmpty ? (
        <CategoryEmptyState
          title="No Classrooms Found"
          description="Add classrooms to assign them to live classes and prevent scheduling conflicts."
          ctaLabel="Add Classroom"
          onCta={() => {
            setEditRow(null)
            setModalOpen(true)
          }}
        />
      ) : showNoResults ? (
        <CategoryEmptyState
          title="No matching classrooms"
          description="Adjust search or filters to find classrooms."
          ctaLabel="Clear filters"
          onCta={() => setFilters({ search: '', status: 'all', center: 'all' })}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80">
          <PaginatedFigmaTable
            data={filtered}
            columns={columns}
            itemLabel="classrooms"
            resetDeps={[filters, rows.length]}
            density="comfortable"
            tableClassName="min-w-[1080px]"
            stickyHeader
          />
        </div>
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
    </div>
  )
}
