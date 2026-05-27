import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, PlusCircle } from 'lucide-react'
import CategoryPageHeader from '../../../components/categories/CategoryPageHeader'
import CategoryFilterBar from '../../../components/categories/CategoryFilterBar'
import CategoryEmptyState from '../../../components/categories/CategoryEmptyState'
import PaginatedFigmaTable from '../../../components/figma/PaginatedFigmaTable'
import AddCityModal from '../../../components/cities/AddCityModal'
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

  const handleSave = async (form) => {
    setSaving(true)
    try {
      await saveCity(form, { isEdit: Boolean(editRow), id: editRow?.id })
      toast.success(editRow ? 'City updated' : 'City saved')
      setModalOpen(false)
      setEditRow(null)
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
    if (!window.confirm(`Delete "${row.placeName}" (${row.code})?`)) return
    try {
      await deleteCity(row.id)
      toast.success('City removed')
      await load()
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    }
  }, [load])

  const handleToggle = useCallback(async (row) => {
    try {
      await toggleCityStatus(row.id)
      toast.success(row.status === 'Active' ? 'City deactivated' : 'City activated')
      await load()
    } catch (e) {
      toast.error(e.message || 'Status update failed')
    }
  }, [load])

  const handleView = useCallback((row) => {
    toast.info(`${row.centerName} · ${row.placeName} (${row.code})`)
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

  return (
    <>
      <CategoryPageHeader
        icon={MapPin}
        title="City"
        subtitle="Manage cities and learning centers"
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
      ) : filtered.length === 0 ? (
        <CategoryEmptyState
          title="No Cities Found"
          description="Add cities and branch places linked to your centres before assigning classrooms."
          ctaLabel="Add City"
          onCta={() => {
            setEditRow(null)
            setModalOpen(true)
          }}
        />
      ) : (
        <PaginatedFigmaTable data={filtered} columns={columns} itemLabel="cities" />
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
    </>
  )
}
