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
  buildLiveClassFromForm,
  buildSubjectFromForm,
} from '../../components/subjects/subjectFormUtils'
import { useAcademicsSubjects } from '../../hooks/useAcademicsSubjects'
import { toast } from '../../utils/toast'
import { cn } from '../../utils/cn'

export default function SubjectsPage() {
  const navigate = useNavigate()
  const { subjects, upsertSubject, deleteSubject, upsertLiveClass } = useAcademicsSubjects()
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
      const matchSearch =
        !q ||
        row.subjectName?.toLowerCase().includes(q) ||
        row.topic?.toLowerCase().includes(q) ||
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
    if (modalContext === 'liveClass' && activeSubject) {
      const liveClass = buildLiveClassFromForm(form, null, activeSubject)
      upsertLiveClass(activeSubject.id, liveClass)
      toast.success('Live class added')
      return
    }

    const existing = modalMode === 'edit' ? activeSubject : null
    const subject = buildSubjectFromForm(form, existing, subjects)
    if (form.classTitle?.trim()) {
      const liveClass = buildLiveClassFromForm(form, null, subject)
      subject.liveClasses = [...(existing?.liveClasses || []), liveClass]
    }
    upsertSubject(subject)
    toast.success(modalMode === 'edit' ? 'Subject updated' : 'Subject created')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      deleteSubject(deleteTarget.id)
      toast.success('Subject deleted')
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
          title="Subjects"
          onAdd={openCreate}
          addLabel="Add Subject"
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
            description="Create your first subject using the Add Subject button above."
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
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete subject?"
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
