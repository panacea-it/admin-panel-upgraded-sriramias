import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookMarked, PlusCircle } from 'lucide-react'
import PageBanner from '../../components/figma/PageBanner'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import AddCourseModal from '../../components/courses/AddCourseModal'
import ViewBatchModal from '../../components/courses/ViewBatchModal'
import BatchManagementTable from '../../components/batch-management/BatchManagementTable'
import { useBatchManagementContext } from '../../contexts/BatchManagementContext'
import { useEditModal } from '../../hooks/useEditModal'
import { useBatchesData } from '../../hooks/useBatchesData'
import { mapCourseToApiPayload } from '../../utils/coursesApiMappers'
import {
  mapBatchRowToTableFormat,
  nextBatchId,
} from '../../utils/batchHelpers'
import { createCourse, updateCourse } from '../../api/coursesAPI'
import { toast } from '../../utils/toast'

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
  const location = useLocation()
  const navigate = useNavigate()
  const restored = location.state?.listState

  const { sourceRows, loading, loadBatches, apiBatches, existingCourseIds } = useBatchesData()
  const { getStudentCount } = useBatchManagementContext()

  const [search, setSearch] = useState(restored?.search ?? '')
  const [statusFilter, setStatusFilter] = useState(restored?.statusFilter ?? 'all')
  const [tablePage, setTablePage] = useState(restored?.page ?? 1)
  const [tablePageSize, setTablePageSize] = useState(restored?.pageSize ?? 10)

  const modal = useEditModal()
  const [viewItem, setViewItem] = useState(null)

  useEffect(() => {
    if (location.state?.listState) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [navigate, location.pathname, location.state?.listState])

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
      filteredRows.map((row) =>
        mapBatchRowToTableFormat(row, [], getStudentCount(row)),
      ),
    [filteredRows, getStudentCount],
  )

  const listState = useMemo(
    () => ({
      search,
      statusFilter,
      page: tablePage,
      pageSize: tablePageSize,
    }),
    [search, statusFilter, tablePage, tablePageSize],
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

  const handleEditBatch = useCallback(
    (tableBatch) => {
      const row = tableBatch.apiRow ?? apiBatches.find((b) => b.id === tableBatch.id)
      if (row) modal.openEdit(row)
    },
    [apiBatches, modal],
  )

  const handleQuickView = useCallback((tableBatch) => {
    const row = tableBatch.apiRow ?? tableBatch
    setViewItem(row)
  }, [])

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
          onSearchChange={(e) => {
            setSearch(e.target.value)
            setTablePage(1)
          }}
          searchPlaceholder="Search batches..."
          status={statusFilter}
          onStatusChange={(e) => {
            setStatusFilter(e.target.value)
            setTablePage(1)
          }}
        />

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#55ace7] border-t-transparent" />
            <p className="mt-4 text-sm text-[#686868]">Loading batches...</p>
          </div>
        ) : (
          <BatchManagementTable
            batches={tableBatches}
            listState={listState}
            page={tablePage}
            pageSize={tablePageSize}
            onPageChange={setTablePage}
            onPageSizeChange={(size) => {
              setTablePageSize(size)
              setTablePage(1)
            }}
            onEditBatch={handleEditBatch}
            onQuickViewBatch={handleQuickView}
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
