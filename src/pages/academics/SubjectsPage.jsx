import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers } from 'lucide-react'
import SubjectHeader from '../../components/subjects/SubjectHeader'
import SubjectFilters from '../../components/subjects/SubjectFilters'
import SubjectTable from '../../components/subjects/SubjectTable'
import SubjectModal from '../../components/subjects/SubjectModal'
import SubjectEmptyState from '../../components/subjects/SubjectEmptyState'
import ConfirmDeleteDialog from '../../components/subjects/ConfirmDeleteDialog'
import {
  buildRecordingFromForm,
  buildSubjectFromForm,
} from '../../components/subjects/subjectFormUtils'
import { useAuth } from '../../contexts/AuthContext'
import { useAcademicsSubjects } from '../../hooks/useAcademicsSubjects'
import {
  buildLiveClassesFromRecurrence,
  isLiveClassCategory,
  isRecordedClassCategory,
} from '../../utils/academicsSubjectsRecurrence'
import {
  normalizeCategories,
  normalizeTopics,
} from '../../utils/subjectCategoryHelpers'
import {
  syncSubjectLiveClassesToModule,
  syncSubjectRecordingsToModule,
} from '../../utils/subjectModuleSync'
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
    upsertLiveClass,
    upsertLiveClassesBatch,
  } = useAcademicsSubjects()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [modalContext, setModalContext] = useState('subject')
  const [activeSubject, setActiveSubject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return subjects.filter((row) => {
      const topics = normalizeTopics(row.topics ?? row.topic)
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
    setModalContext('subject')
    setModalOpen(true)
  }

  const openRowAdd = (row) => {
    setActiveSubject(row)
    setModalMode('add')
    setModalContext('liveClass')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setActiveSubject(row)
    setModalMode('edit')
    setModalContext('subject')
    setModalOpen(true)
  }

  const handleModalSubmit = async (form) => {
    const actorName = user?.name || user?.email || 'Admin'
    const categories = normalizeCategories(form.categories ?? form.category)

    if (modalContext === 'liveClass' && activeSubject) {
      const rows = buildLiveClassesFromRecurrence(form, activeSubject, null, actorName)
      let syncedRows = rows
      try {
        syncedRows = await syncSubjectLiveClassesToModule(rows, activeSubject, { actor: actorName })
      } catch {
        toast.error('Live class saved locally but sync to Schedule/Live Classes failed')
      }
      if (syncedRows.length > 1) {
        upsertLiveClassesBatch(activeSubject.id, syncedRows)
        toast.success(`${syncedRows.length} live classes scheduled`)
      } else {
        upsertLiveClass(activeSubject.id, syncedRows[0])
        toast.success('Live class added')
      }
      return
    }

    const existing = modalMode === 'edit' ? activeSubject : null
    const subjectRow = buildSubjectFromForm(form, existing, subjects)

    if (isLiveClassCategory(categories) && form.classTitle?.trim()) {
      const rows = buildLiveClassesFromRecurrence(form, subjectRow, null, actorName)
      const existingLive = existing?.liveClasses || []
      subjectRow.liveClasses = [...existingLive, ...rows]
    }

    if (isRecordedClassCategory(categories)) {
      const recording = buildRecordingFromForm(form, existing?.recordings?.[0], subjectRow)
      const existingRec = existing?.recordings || []
      const recIdx = existingRec.findIndex((r) => r.id === recording.id)
      subjectRow.recordings =
        recIdx >= 0
          ? existingRec.map((r, i) => (i === recIdx ? recording : r))
          : [...existingRec, recording]
    }

    upsertSubject(subjectRow)

    try {
      let needsResave = false
      if (isLiveClassCategory(categories) && subjectRow.liveClasses?.length) {
        const rowsToSync = subjectRow.liveClasses.filter((lc) => !lc.linkedLessonId)
        if (rowsToSync.length) {
          const synced = await syncSubjectLiveClassesToModule(rowsToSync, subjectRow, {
            actor: actorName,
          })
          const syncedById = new Map(synced.map((r) => [r.id, r]))
          subjectRow.liveClasses = subjectRow.liveClasses.map(
            (lc) => syncedById.get(lc.id) || lc,
          )
          needsResave = true
        }
      }
      if (isRecordedClassCategory(categories) && subjectRow.recordings?.length) {
        subjectRow.recordings = await syncSubjectRecordingsToModule(
          subjectRow.recordings,
          subjectRow,
          { actor: actorName },
        )
        needsResave = true
      }
      if (needsResave) upsertSubject(subjectRow)
    } catch (err) {
      toast.error(err?.message || 'Subject saved; failed to sync to Live Classes modules')
    }

    toast.success(modalMode === 'edit' ? facultySubjectLabels.updated : facultySubjectLabels.created)
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
              onAddRow={openRowAdd}
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
        context={modalContext}
        subject={activeSubject}
        subjects={subjects}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${facultySubjectLabels.singular.toLowerCase()}?`}
        message={
          deleteTarget
            ? `Remove "${deleteTarget.subjectName}" and all linked live classes? This cannot be undone.`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  )
}
