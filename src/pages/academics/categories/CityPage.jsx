import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, PlusCircle } from 'lucide-react'
import CategoryPageHeader from '../../../components/categories/CategoryPageHeader'
import CategoryFilterBar from '../../../components/categories/CategoryFilterBar'
import CategoryEmptyState from '../../../components/categories/CategoryEmptyState'
import PaginatedFigmaTable from '../../../components/figma/PaginatedFigmaTable'
import AddCityModal from '../../../components/cities/AddCityModal'
import ViewCityModal from '../../../components/cities/ViewCityModal'
import ConfirmDeleteDialog from '../../../components/subjects/ConfirmDeleteDialog'
import { buildCityTableColumns } from '../../../components/cities/CityTable'
import { deleteCity, fetchCities, saveCity, toggleCityStatus } from '../../../api/citiesAPI'
import { useCenters } from '../../../contexts/CentersContext'
import { toast } from '../../../utils/toast'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

export default function CityPage() {
  const { activeCenters } = useCenters()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ search: '', status: 'all', center: 'all' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState(null)
  const [viewRow, setViewRow] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const centerOptions = useMemo(
    () => [
      { value: 'all', label: 'Center' },
      ...activeCenters.map((c) => ({
        value: String(c.centerId),
        label: c.centerName,
      })),
    ],
    [activeCenters],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchCities()
      setRows(list)
    } catch (e) {
      toast.error(e.message || 'Failed to load cities')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const onUpdate = () => load()
    window.addEventListener('cities-updated', onUpdate)
    return () => window.removeEventListener('cities-updated', onUpdate)
  }, [load])

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim()
    return rows.filter((row) => {
      const matchSearch =
        !q ||
        row.code?.toLowerCase().includes(q) ||
        row.placeName?.toLowerCase().includes(q) ||
        row.centerName?.toLowerCase().includes(q)
      const matchStatus = filters.status === 'all' || row.status === filters.status
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
      const saved = await saveCity(form, { isEdit: Boolean(editRow), id: editRow?.id })
      mergeSavedRow(saved)
      toast.success(editRow ? 'City updated' : 'City added successfully')
      setModalOpen(false)
      setEditRow(null)
      if (!editRow) {
        setFilters((f) => ({
          ...f,
          search: '',
          center: saved.centerId ? String(saved.centerId) : 'all',
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

  const handleDelete = useCallback((row) => {
    setDeleteTarget(row)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCity(deleteTarget.id)
      toast.success('City removed')
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
      await load()
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, load])

  const handleToggle = useCallback(async (row) => {
    try {
      const saved = await toggleCityStatus(row.id)
      mergeSavedRow(saved)
      toast.success(row.status === 'Active' ? 'City deactivated' : 'City activated')
      await load()
    } catch (e) {
      toast.error(e.message || 'Status update failed')
    }
  }, [load, mergeSavedRow])

  const handleView = useCallback((row) => {
    setViewRow(row)
  }, [])

  const handleEdit = useCallback((row) => {
    setEditRow(row)
    setModalOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      buildCityTableColumns({
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
      <CategoryPageHeader icon={MapPin} hideTitle>
        <button
          type="button"
          onClick={() => {
            setEditRow(null)
            setModalOpen(true)
          }}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4" />
          Add City
        </button>
      </CategoryPageHeader>

      <CategoryFilterBar
        search={filters.search}
        onSearchChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        searchPlaceholder="Search city..."
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
          title="No Cities Found"
          description="Add cities and branch places linked to your centres before assigning classrooms."
          ctaLabel="Add City"
          onCta={() => {
            setEditRow(null)
            setModalOpen(true)
          }}
        />
      ) : showNoResults ? (
        <CategoryEmptyState
          title="No matching cities"
          description="Try clearing search or filters to see all cities."
          ctaLabel="Clear filters"
          onCta={() => setFilters({ search: '', status: 'all', center: 'all' })}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80">
          <PaginatedFigmaTable
            data={filtered}
            columns={columns}
            itemLabel="cities"
            resetDeps={[filters, rows.length]}
            tableClassName="min-w-[720px]"
          />
        </div>
      )}

      <AddCityModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditRow(null)
        }}
        city={editRow}
        onSave={handleSave}
        saving={saving}
      />

      <ViewCityModal open={Boolean(viewRow)} onClose={() => setViewRow(null)} city={viewRow} />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete item?"
        message="Are you sure you want to delete this item?"
        confirmLabel="Confirm Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
