import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers } from 'lucide-react'
import SubjectHeader from '../../components/subjects/SubjectHeader'
import SubjectFilters from '../../components/subjects/SubjectFilters'
import SubjectTable from '../../components/subjects/SubjectTable'
import SubjectModal from '../../components/subjects/SubjectModal'
import SubjectAddContentModal from '../../components/subjects/SubjectAddContentModal'
import SubjectEmptyState from '../../components/subjects/SubjectEmptyState'
import ConfirmDeleteDialog from '../../components/subjects/ConfirmDeleteDialog'
import {
  buildPdfFromForm,
  buildRecordingFromForm,
  buildSubjectFromForm,
} from '../../components/subjects/subjectFormUtils'
import { useAuth } from '../../contexts/AuthContext'
import { useAcademicsSubjects } from '../../hooks/useAcademicsSubjects'
import { useBatchesData } from '../../hooks/useBatchesData'
import { buildActiveBatchOptions, formatBatchSelectLabel } from '../../utils/batchSelectHelpers'
import { buildLiveClassesFromRecurrence } from '../../utils/academicsSubjectsRecurrence'
import {
  contentTypeLabel,
  isLiveClassCategory,
  isPdfCategory,
  isRecordedClassCategory,
  isTestSeriesCategory,
  normalizeCategories,
} from '../../utils/subjectCategoryHelpers'
import {
  syncSubjectLiveClassesToModule,
  syncSubjectRecordingsToModule,
} from '../../utils/subjectModuleSync'
import { serializeTestSeriesForStorage } from '../../utils/batchTestSeriesForm'
import { toast } from '../../utils/toast'
import { cn } from '../../utils/cn'
import { facultySubjectLabels } from '../../data/facultySubjectLabels'

export default function SubjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    subjects,
    upsertSubject,
    deleteSubject,
  } = useAcademicsSubjects()
  const { sourceRows: batchRows } = useBatchesData()
  const batchOptions = useMemo(() => buildActiveBatchOptions(batchRows), [batchRows])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [activeSubject, setActiveSubject] = useState(null)
  const [addContentOpen, setAddContentOpen] = useState(false)
  const [addContentSubject, setAddContentSubject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return subjects.filter((row) => {
      const topics = row.topics ?? (row.topic ? [row.topic] : [])
      const matchSearch =
        !q ||
        row.subjectName?.toLowerCase().includes(q) ||
        topics.some((t) => t.toLowerCase().includes(q)) ||
        row.teacher?.toLowerCase().includes(q) ||
        String(row.id).includes(q)
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [subjects, search, statusFilter])

  const openCreate = () => {
    setActiveSubject(null)
    setModalMode('add')
    setModalOpen(true)
  }

  const openAddContent = (row) => {
    setAddContentSubject(row)
    setAddContentOpen(true)
  }

  const openEdit = (row) => {
    setActiveSubject(row)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleSubjectModalSubmit = async (form) => {
    const existing = modalMode === 'edit' ? activeSubject : null
    const subjectRow = buildSubjectFromForm(form, existing, subjects)
    const batchOpt = form.batchId
      ? {
          batchId: form.batchId,
          batch:
            formatBatchSelectLabel(
              batchOptions.find((b) => String(b.id) === String(form.batchId)),
            ) || form.batchId,
        }
      : {}
    upsertSubject({ ...subjectRow, ...batchOpt })
    toast.success(modalMode === 'edit' ? facultySubjectLabels.updated : facultySubjectLabels.created)
  }

  const handleAddContentSubmit = async (form, contentType) => {
    const actorName = user?.name || user?.email || 'Admin'
    const subject = subjects.find((s) => s.id === addContentSubject?.id) || addContentSubject
    if (!subject) return

    const categories = normalizeCategories(subject.categories)
    let updated = { ...subject }
    const batchMeta = form.batchId ? { batchId: form.batchId } : {}

    try {
      if (contentType === 'live' && isLiveClassCategory(categories)) {
        const rows = buildLiveClassesFromRecurrence(form, updated, null, actorName)
        let syncedRows = rows
        try {
          syncedRows = await syncSubjectLiveClassesToModule(rows, updated, { actor: actorName })
        } catch {
          toast.error('Live class saved locally but sync to Schedule/Live Classes failed')
        }
        const existingLive = updated.liveClasses || []
        updated = {
          ...updated,
          ...batchMeta,
          liveClasses: [...existingLive, ...syncedRows.map((r) => ({ ...r, ...batchMeta }))],
        }
        if (syncedRows.length > 1) {
          toast.success(`${syncedRows.length} live classes scheduled`)
        } else {
          toast.success('Live class added')
        }
      } else if (contentType === 'recording' && isRecordedClassCategory(categories)) {
        const recording = buildRecordingFromForm(form, null, updated)
        const existingRec = updated.recordings || []
        let recordings = [...existingRec, { ...recording, ...batchMeta }]
        try {
          recordings = await syncSubjectRecordingsToModule(recordings, updated, { actor: actorName })
        } catch {
          toast.error('Recording saved locally; module sync failed')
        }
        updated = { ...updated, ...batchMeta, recordings }
        toast.success('Recording added')
      } else if (contentType === 'test' && isTestSeriesCategory(categories)) {
        updated = {
          ...updated,
          ...batchMeta,
          enableTestSeries: true,
          testSeries: serializeTestSeriesForStorage(form.testSeries),
        }
        toast.success('Test series saved')
      } else if (contentType === 'pdf' && isPdfCategory(categories)) {
        const pdf = buildPdfFromForm(form, null, updated)
        const existingPdfs = updated.pdfs || []
        updated = {
          ...updated,
          ...batchMeta,
          pdfs: [...existingPdfs, { ...pdf, ...batchMeta }],
        }
        toast.success('PDF added')
      } else {
        toast.error(`Cannot add ${contentTypeLabel(contentType)} for this subject`)
        return
      }

      upsertSubject(updated)

      if (contentType === 'live' && updated.liveClasses?.length) {
        const rowsToSync = updated.liveClasses.filter((lc) => !lc.linkedLessonId)
        if (rowsToSync.length) {
          try {
            const synced = await syncSubjectLiveClassesToModule(rowsToSync, updated, { actor: actorName })
            const syncedById = new Map(synced.map((r) => [r.id, r]))
            updated.liveClasses = updated.liveClasses.map((lc) => syncedById.get(lc.id) || lc)
            upsertSubject(updated)
          } catch {
            /* already toasted */
          }
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save content')
      throw err
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      deleteSubject(deleteTarget.id)
      toast.success(facultySubjectLabels.deleted)
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <SubjectHeader
          icon={Layers}
          title={facultySubjectLabels.plural}
          onAdd={openCreate}
          addLabel={facultySubjectLabels.add}
          iconClassName="text-[#246392]"
        />

        <SubjectFilters
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
        />

        {filtered.length === 0 && subjects.length === 0 ? (
          <SubjectEmptyState
            description={`Create your first subject using the ${facultySubjectLabels.add} button above.`}
          />
        ) : (
          <div
            className={cn(
              'overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80',
            )}
          >
            <SubjectTable
              data={filtered}
              search={search}
              statusFilter={statusFilter}
              onAddRow={openAddContent}
              onViewList={(row) => navigate(`/academics/subjects/${row.id}`)}
              onEdit={openEdit}
              onDelete={(row) => setDeleteTarget(row)}
            />
          </div>
        )}
      </section>

      <SubjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        context="subject"
        subject={activeSubject}
        subjects={subjects}
        onSubmit={handleSubjectModalSubmit}
      />

      <SubjectAddContentModal
        open={addContentOpen}
        onClose={() => {
          setAddContentOpen(false)
          setAddContentSubject(null)
        }}
        subject={addContentSubject}
        subjects={subjects}
        onSubmit={handleAddContentSubmit}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${facultySubjectLabels.singular.toLowerCase()}?`}
        message={
          deleteTarget
            ? `Remove "${deleteTarget.subjectName}" and all linked content? This cannot be undone.`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  )
}
