import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, PlusCircle } from 'lucide-react'
import CategoryPageHeader from '../../../components/categories/CategoryPageHeader'
import ProgramsFilterBar from '../../../components/categories/ProgramsFilterBar'
import ProgramsTable from '../../../components/categories/ProgramsTable'
import CategoryStatusBadge from '../../../components/categories/CategoryStatusBadge'
import CategoryTableActions from '../../../components/categories/CategoryTableActions'
import CategoryEmptyState from '../../../components/categories/CategoryEmptyState'
import ProgramFormModal from '../../../components/categories/ProgramFormModal'
import ViewProgramModal from '../../../components/categories/ViewProgramModal'
import ConfirmDeleteDialog from '../../../components/subjects/ConfirmDeleteDialog'
import { seedProgramCenterIds } from '../../../data/programsData'
import { loadPrograms, savePrograms } from '../../../utils/programsStorage'
import { getCoursesCatalog, getCoursesByIds } from '../../../utils/coursesCatalog'
import { formatCentreNamesLabel } from '../../../utils/programHelpers'
import { formatCategoryDateTime } from '../../../utils/formatDateTime'
import { useCenters } from '../../../contexts/CentersContext'
import { useEditModal } from '../../../hooks/useEditModal'
import { toast } from '../../../utils/toast'
import { cn } from '../../../utils/cn'

const PROGRAMS_PATH = '/academics/categories/programs'

function CreateButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:scale-[1.02] active:scale-[0.98]"
    >
      <PlusCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      Add Program
    </button>
  )
}

function LinkedCoursesBadge({ count }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#cbeeff] text-sm font-bold text-[#246392] ring-2 ring-[#e8f4fc]">
      {count}
    </span>
  )
}

export default function ProgramsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { activeCenters } = useCenters()
  const modal = useEditModal()
  const routeHandledRef = useRef(false)

  const [programs, setPrograms] = useState(() => loadPrograms(activeCenters))
  const [catalog, setCatalog] = useState([])
  const [filters, setFilters] = useState({ search: '', status: 'all', centre: 'all' })
  const [viewProgram, setViewProgram] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    getCoursesCatalog().then(setCatalog)
  }, [])

  useEffect(() => {
    if (activeCenters.length) {
      setPrograms((prev) => {
        const next = seedProgramCenterIds(prev, activeCenters)
        savePrograms(next)
        return next
      })
    }
  }, [activeCenters.length])

  useEffect(() => {
    savePrograms(programs)
  }, [programs])

  const resetToProgramsList = useCallback(() => {
    modal.close()
    setViewProgram(null)
    routeHandledRef.current = false
    if (location.pathname !== PROGRAMS_PATH) {
      navigate(PROGRAMS_PATH, { replace: true })
    }
  }, [location.pathname, modal, navigate])

  const closeFormModal = useCallback(() => {
    resetToProgramsList()
  }, [resetToProgramsList])

  useEffect(() => {
    if (!id || routeHandledRef.current) return
    const program = programs.find((p) => p.id === id || p.programId === id)
    if (!program) return

    routeHandledRef.current = true
    if (location.pathname.includes('/edit/')) {
      modal.openEdit(program)
    } else {
      setViewProgram(program)
    }
  }, [id, programs, location.pathname, modal])

  const centreFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'Centre Wise' },
      ...activeCenters.map((c) => ({
        value: String(c.centerId),
        label: c.centerName,
      })),
    ],
    [activeCenters],
  )

  const enrichedPrograms = useMemo(
    () =>
      programs.map((p) => ({
        ...p,
        linkedCount: (p.courseIds || []).length,
        linkedCourses: getCoursesByIds(catalog, p.courseIds || []),
        centreLabel: formatCentreNamesLabel(activeCenters, p.centerIds),
      })),
    [programs, catalog, activeCenters],
  )

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return enrichedPrograms.filter((row) => {
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.programId?.toLowerCase().includes(q) ||
        row.centreLabel?.toLowerCase().includes(q)
      const matchStatus = filters.status === 'all' || row.status === filters.status
      const matchCentre =
        filters.centre === 'all' ||
        (row.centerIds || []).map(String).includes(filters.centre)
      return matchSearch && matchStatus && matchCentre
    })
  }, [enrichedPrograms, filters])

  const handleSave = (form, { isEdit, id: editId }) => {
    const now = new Date().toISOString()
    const payload = {
      name: form.name,
      description: form.description || '',
      status: form.status || 'Active',
      courseIds: form.courseIds || [],
      centerIds: form.centerIds || [],
      updatedAt: now,
    }

    if (isEdit) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...payload } : p)),
      )
      toast.success('Program updated')
    } else {
      setPrograms((prev) => [
        ...prev,
        {
          id: form.programId,
          programId: form.programId,
          ...payload,
          createdAt: now,
        },
      ])
      toast.success('Program created')
    }
    closeFormModal()
  }

  const handleDelete = (row) => {
    setDeleteTarget(row)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setPrograms((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setSelectedIds((prev) => prev.filter((sid) => sid !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success('Program deleted')
  }

  const handleToggle = (row) => {
    const next = row.status === 'Active' ? 'In Active' : 'Active'
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === row.id ? { ...p, status: next, updatedAt: new Date().toISOString() } : p,
      ),
    )
    toast.success(next === 'Active' ? 'Program enabled' : 'Program disabled')
  }

  const openCreate = () => {
    routeHandledRef.current = true
    modal.openCreate()
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((r) => r.id))
    }
  }

  const clearFilters = () => setFilters({ search: '', status: 'all', centre: 'all' })

  const columns = [
    {
      key: 'select',
      label: '',
      headerClassName: 'w-12 pl-5 sm:pl-6',
      cellClassName: 'pl-5 sm:pl-6',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => {
            setSelectedIds((prev) =>
              prev.includes(row.id) ? prev.filter((x) => x !== row.id) : [...prev, row.id],
            )
          }}
          className="h-4 w-4 rounded accent-[#246392]"
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: 'programId',
      label: 'Program ID',
      render: (row) => (
        <span className="font-mono text-sm font-semibold text-[#111]">
          {row.programId || row.id}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Program Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#cbeeff] text-xs font-bold text-[#246392]">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-[#111]">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'linkedCount',
      label: 'Linked Courses',
      render: (row) => <LinkedCoursesBadge count={row.linkedCount} />,
    },
    {
      key: 'centre',
      label: 'Centre Name',
      cellClassName: 'max-w-[220px]',
      render: (row) => (
        <span className="text-sm font-medium capitalize text-[#444]" title={row.centreLabel}>
          {row.centreLabel}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created On',
      render: (row) => (
        <span className="whitespace-nowrap text-sm text-[#444]">
          {formatCategoryDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <CategoryStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      headerClassName: 'min-w-[11rem] text-right',
      cellClassName: 'min-w-[11rem] text-right',
      render: (row) => (
        <CategoryTableActions
          status={row.status}
          onView={() => setViewProgram(row)}
          onEdit={() => {
            routeHandledRef.current = false
            navigate(`${PROGRAMS_PATH}/edit/${row.id}`)
            modal.openEdit(row)
          }}
          onDelete={() => handleDelete(row)}
          onToggleStatus={() => handleToggle(row)}
        />
      ),
    },
  ]

  const viewLinked = viewProgram
    ? getCoursesByIds(catalog, viewProgram.courseIds || [])
    : []

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="programs"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="space-y-5 sm:space-y-6"
      >
        <CategoryPageHeader icon={LayoutGrid} hideTitle>
          <CreateButton onClick={openCreate} />
        </CategoryPageHeader>

        <ProgramsFilterBar
          search={filters.search}
          onSearchChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          centre={filters.centre}
          onCentreChange={(e) => setFilters((f) => ({ ...f, centre: e.target.value }))}
          centreOptions={centreFilterOptions}
          status={filters.status}
          onStatusChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        />

        {filtered.length > 0 && (
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-xl border border-slate-100/80 bg-white/70 px-4 py-2.5',
              'text-sm text-[#686868] shadow-[0_2px_8px_rgba(15,23,42,0.04)]',
            )}
          >
            <input
              type="checkbox"
              checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-[#246392]"
              id="programs-select-all"
            />
            <label htmlFor="programs-select-all" className="cursor-pointer font-medium">
              Select all on this page
            </label>
            {selectedIds.length > 0 && (
              <span className="ml-auto text-xs font-semibold text-[#246392]">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}

        {programs.length === 0 ? (
          <CategoryEmptyState
            title="No Programs Found"
            description="Create your first academic program and link courses."
            ctaLabel="Add Program"
            onCta={openCreate}
          />
        ) : filtered.length === 0 ? (
          <CategoryEmptyState
            title="No matching programs"
            description="Try adjusting search or centre filter."
            ctaLabel="Clear filters"
            onCta={clearFilters}
          />
        ) : (
          <ProgramsTable
            columns={columns}
            data={filtered}
            resetDeps={[filters]}
            emptyMessage="No programs match your filters."
          />
        )}

        <ProgramFormModal
          open={modal.isOpen}
          onClose={closeFormModal}
          program={modal.selectedItem}
          programs={programs}
          onSubmit={handleSave}
        />

        <ViewProgramModal
          open={Boolean(viewProgram)}
          onClose={() => {
            setViewProgram(null)
            resetToProgramsList()
          }}
          program={viewProgram}
          linkedCourses={viewLinked}
        />

        <ConfirmDeleteDialog
          open={Boolean(deleteTarget)}
          title="Delete item?"
          message="Are you sure you want to delete this item?"
          confirmLabel="Confirm Delete"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      </motion.div>
    </AnimatePresence>
  )
}
