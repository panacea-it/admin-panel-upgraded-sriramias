import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookMarked, PlusCircle } from 'lucide-react'
import PageBanner from '../../components/figma/PageBanner'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import AddCourseModal from '../../components/courses/AddCourseModal'
import ViewBatchModal from '../../components/courses/ViewBatchModal'
import BatchManagementTable from '../../components/batch-management/BatchManagementTable'
import { useEditModal } from '../../hooks/useEditModal'
import { useBatchStudents } from '../../hooks/useBatchStudents'
import { mapCourseToApiPayload } from '../../utils/coursesApiMappers'
import {
  enrichBatchRow,
  mapBatchRowToTableFormat,
  mapInitialBatchesToRows,
  nextBatchId,
} from '../../utils/batchHelpers'
import {
  createCourse,
  fetchCourses,
  updateCourse,
} from '../../api/coursesAPI'
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

function resolveStudentKey(row, getStudents) {
  if (getStudents(row.id).length) return row.id
  if (row.batchId && getStudents(row.batchId).length) return row.batchId
  return row.id
}

function rowMatchesSearch(row, q) {
  if (!q) return true
  const courseName = row.linkedCourseName || row.program || 'Course'
  const batchLabel = row.batchName || row.name || 'Batch'
  const displayName = `${courseName} - ${batchLabel}`
  const trainerName = row.formData?.trainerName || row.trainerName || ''
  return (
    String(row.batchId || '').toLowerCase().includes(q) ||
    displayName.toLowerCase().includes(q) ||
    courseName.toLowerCase().includes(q) ||
    batchLabel.toLowerCase().includes(q) ||
    trainerName.toLowerCase().includes(q)
  )
}

export default function BatchesPage() {
  const [apiBatches, setApiBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedBatchId, setExpandedBatchId] = useState(null)
  const modal = useEditModal()
  const [viewItem, setViewItem] = useState(null)

  const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
  } = useBatchStudents()

  const loadBatches = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await fetchCourses()
      setApiBatches(rows.map((row, i) => enrichBatchRow(row, i)))
    } catch {
      setApiBatches(mapInitialBatchesToRows().map((row, i) => enrichBatchRow(row, i)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  const existingCourseIds = useMemo(
    () => apiBatches.map((b) => b.courseId).filter(Boolean),
    [apiBatches],
  )

  const sourceRows = useMemo(() => {
    if (apiBatches.length > 0) return apiBatches
    return mapInitialBatchesToRows()
  }, [apiBatches])

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim()
    return sourceRows.filter((row) => {
      const matchSearch = rowMatchesSearch(row, q)
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [sourceRows, search, statusFilter])

  const tableBatches = useMemo(
    () =>
      filteredRows.map((row) => {
        const key = resolveStudentKey(row, getStudents)
        return mapBatchRowToTableFormat(row, getStudents(key))
      }),
    [filteredRows, getStudents],
  )

  const handleSaveBatch = async (form, { isEdit, id }) => {
    const existing = isEdit ? apiBatches.find((b) => b.id === id) : null
    const batchId = form.batchId || existing?.batchId || nextBatchId(apiBatches)
    const courseId = form.courseId || existing?.courseId
    if (!courseId) {
      toast.error('Please select a course')
      return
    }
    const payload = mapCourseToApiPayload(
      {
        ...form,
        batchId,
        courseId,
        academicCourseId: form.academicCourseId,
        courseName: form.courseName,
        status: form.status || 'Active',
      },
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

  const toggleBatch = useCallback((batchId) => {
    setExpandedBatchId((prev) => (prev === batchId ? null : batchId))
  }, [])

  const studentKeyForTableBatch = (tableBatch) =>
    resolveStudentKey(
      tableBatch.apiRow ?? { id: tableBatch.id, batchId: tableBatch.batchId },
      getStudents,
    )

  const handleAddStudent = (batchId, form) => {
    const row = tableBatches.find((b) => b.id === batchId)
    const key = row ? studentKeyForTableBatch(row) : batchId
    addStudent(key, form)
    toast.success(`${form.name} enrolled successfully`)
  }

  const handleUpdateStudent = (batchId, studentId, form) => {
    const row = tableBatches.find((b) => b.id === batchId)
    const key = row ? studentKeyForTableBatch(row) : batchId
    updateStudent(key, studentId, form)
    toast.success('Student updated')
  }

  const handleDeleteStudent = (batchId, studentId) => {
    const row = tableBatches.find((b) => b.id === batchId)
    const key = row ? studentKeyForTableBatch(row) : batchId
    deleteStudent(key, studentId)
    toast.success('Student removed from batch')
  }

  const handleToggleStudentStatus = (batchId, studentId) => {
    const row = tableBatches.find((b) => b.id === batchId)
    const key = row ? studentKeyForTableBatch(row) : batchId
    const student = getStudents(key).find((s) => s.id === studentId)
    const next = student?.status === 'Active' ? 'In Active' : 'Active'
    toggleStudentStatus(key, studentId)
    toast.success(next === 'Active' ? 'Student enabled' : 'Student disabled')
  }

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

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#55ace7] border-t-transparent" />
            <p className="mt-4 text-sm text-[#686868]">Loading batches...</p>
          </div>
        ) : (
          <BatchManagementTable
            batches={tableBatches}
            expandedBatchId={expandedBatchId}
            onToggleBatch={toggleBatch}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onToggleStudentStatus={handleToggleStudentStatus}
            resetDeps={[search, statusFilter]}
          />
        )}
      </section>

      <AddCourseModal
        open={modal.isOpen}
        onClose={modal.close}
        item={modal.selectedItem}
        onSubmit={handleSaveBatch}
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
