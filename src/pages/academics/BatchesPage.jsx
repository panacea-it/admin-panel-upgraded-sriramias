import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookMarked, PlusCircle } from 'lucide-react'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import AddCourseModal from '../../components/courses/AddCourseModal'
import ViewBatchModal from '../../components/courses/ViewBatchModal'
import CategoryTableActions from '../../components/categories/CategoryTableActions'
import CategoryStatusBadge from '../../components/categories/CategoryStatusBadge'
import { useEditModal } from '../../hooks/useEditModal'
import { mapCourseToApiPayload } from '../../utils/coursesApiMappers'
import { enrichBatchRow, nextBatchId, nextCourseId } from '../../utils/batchHelpers'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import {
  createCourse,
  deleteCourse,
  fetchCourses,
  updateCourse,
} from '../../api/coursesAPI'
import { cn } from '../../utils/cn'
import { toast, toastMessages } from '../../utils/toast'

function BannerButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 min-h-[38px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:scale-[1.02] active:scale-[0.98]"
    >
      <PlusCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      {children}
    </button>
  )
}

export default function BatchesPage() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const modal = useEditModal()
  const [viewItem, setViewItem] = useState(null)

  const loadBatches = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await fetchCourses()
      setBatches(rows.map((row, i) => enrichBatchRow(row, i)))
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || toastMessages.error.server
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  const existingCourseIds = useMemo(
    () => batches.map((b) => b.courseId).filter(Boolean),
    [batches],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return batches.filter((row) => {
      const matchSearch =
        !q ||
        row.batchName?.toLowerCase().includes(q) ||
        row.batchId?.toLowerCase().includes(q) ||
        row.courseId?.toLowerCase().includes(q) ||
        row.durationLabel?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [batches, search, statusFilter])

  const handleSaveBatch = async (form, { isEdit, id }) => {
    const existing = isEdit ? batches.find((b) => b.id === id) : null
    const batchId = form.batchId || existing?.batchId || nextBatchId(batches)
    const courseId =
      form.courseId || existing?.courseId || nextCourseId(batches)
    const payload = mapCourseToApiPayload(
      { ...form, batchId, courseId, status: form.status || 'Active' },
      existing,
    )

    if (isEdit && id != null) {
      await updateCourse(id, payload)
      toast.success('Batch updated')
    } else {
      await createCourse(payload)
      toast.success('Batch created')
    }
    await loadBatches()
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete batch "${row.batchName || row.name}"?`)) return
    try {
      await deleteCourse(row.id)
      setBatches((prev) => prev.filter((b) => b.id !== row.id))
      setSelectedIds((prev) => prev.filter((sid) => sid !== row.id))
      toast.success('Batch deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Delete failed')
    }
  }

  const handleToggleStatus = async (row) => {
    const next = row.status === 'Active' ? 'In Active' : 'Active'
    const form = { ...(row.formData || {}), status: next, batchId: row.batchId }
    try {
      await updateCourse(row.id, mapCourseToApiPayload(form, row))
      setBatches((prev) =>
        prev.map((b) =>
          b.id === row.id ? { ...b, status: next, modifiedAt: new Date().toISOString() } : b,
        ),
      )
      toast.success(next === 'Active' ? 'Batch enabled' : 'Batch disabled')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((r) => r.id))
    }
  }

  const columns = [
    {
      key: 'select',
      label: '',
      headerClassName: 'w-12 pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10',
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
          aria-label={`Select ${row.batchName}`}
        />
      ),
    },
    {
      key: 'batchId',
      label: 'Batch ID',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-[#111]">{row.batchId || '—'}</span>
      ),
    },
    {
      key: 'batchName',
      label: 'Batch Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#cbeeff] text-xs font-bold text-[#246392]">
            {(row.batchName || row.name || 'B').slice(0, 2).toUpperCase()}
          </span>
          <span className="font-semibold text-[#111]">{row.batchName || row.name}</span>
        </div>
      ),
    },
    {
      key: 'program',
      label: 'Program',
      render: (row) => <span className="text-sm text-[#444]">{row.program || '—'}</span>,
    },
    {
      key: 'examCategory',
      label: 'Exam Category',
      render: (row) => <span className="text-sm text-[#444]">{row.examCategory || '—'}</span>,
    },
    {
      key: 'examSubCategory',
      label: 'Exam Subcategory',
      render: (row) => <span className="text-sm text-[#444]">{row.examSubCategory || '—'}</span>,
    },
    {
      key: 'linkedCourseName',
      label: 'Course Name',
      render: (row) => (
        <span className="text-sm font-medium text-[#444]">{row.linkedCourseName || '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created On',
      render: (row) => (
        <span className="whitespace-nowrap text-sm">
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
      label: 'Actions',
      render: (row) => (
        <CategoryTableActions
          status={row.status}
          onView={() => setViewItem(row)}
          onEdit={() => modal.openEdit(row)}
          onDelete={() => handleDelete(row)}
          onToggleStatus={() => handleToggleStatus(row)}
        />
      ),
    },
  ]

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <PageBanner
          icon={BookMarked}
          iconClassName="text-[#dc2626]"
          title="Batch Manager"
          className="sticky top-0 z-20 from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
        >
          <BannerButton onClick={modal.openCreate}>Add Batch</BannerButton>
        </PageBanner>

        <CourseFilterToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search batches..."
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
        />

        {filtered.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#686868]">
            <input
              type="checkbox"
              checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-[#246392]"
            />
            <span>Select all on this page</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#55ace7] border-t-transparent" />
            <p className="mt-4 text-sm text-[#686868]">Loading batches...</p>
          </div>
        ) : (
          <div
            className={cn(
              'overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80',
            )}
          >
            <PaginatedFigmaTable
              columns={columns}
              data={filtered}
              emptyMessage="No batches found."
              itemLabel="batches"
              resetDeps={[search, statusFilter]}
              rowClassName="transition-colors hover:bg-[#f8fbff]"
              tableClassName="[&_thead]:sticky [&_thead]:top-[4.5rem] [&_thead]:z-10"
            />
          </div>
        )}
      </section>

      <AddCourseModal
        open={modal.isOpen}
        onClose={modal.close}
        item={modal.selectedItem}
        onSubmit={handleSaveBatch}
        variant="batch"
        existingCourseIds={existingCourseIds}
      />

      <ViewBatchModal
        open={Boolean(viewItem)}
        onClose={() => setViewItem(null)}
        item={viewItem}
      />
    </div>
  )
}
