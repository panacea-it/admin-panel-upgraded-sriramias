import { useEffect, useRef, useState } from 'react'
import { getModalEditKey, useInitOnModalOpen } from '../../hooks/modalFormSync'
import { LayoutGrid } from 'lucide-react'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import { CourseFormField, CourseInput } from '../courses/CourseFormField'
import CentreMultiSelect from './CentreMultiSelect'
import CourseMultiSelect from './CourseMultiSelect'
import { useCenters } from '../../contexts/CentersContext'
import { getCoursesCatalog } from '../../utils/coursesCatalog'
import { nextProgramId } from '../../data/programsData'
import { toast } from '../../utils/toast'

function buildForm(program, programs) {
  if (program) {
    return {
      programId: program.programId || program.id,
      name: program.name || '',
      description: program.description || '',
      status: program.status || 'Active',
      courseIds: program.courseIds || [],
      centerIds: program.centerIds || [],
    }
  }
  return {
    programId: nextProgramId(programs),
    name: '',
    description: '',
    status: 'Active',
    courseIds: [],
    centerIds: [],
  }
}

export default function ProgramFormModal({ open, onClose, program, programs = [], onSubmit }) {
  const isEdit = Boolean(program)
  const { activeCenters } = useCenters()
  const [form, setForm] = useState(buildForm(null, programs))
  const [errors, setErrors] = useState({})
  const [catalog, setCatalog] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const closingRef = useRef(false)
  const programRef = useRef(program)
  programRef.current = program
  const programsRef = useRef(programs)
  programsRef.current = programs
  const editKey = getModalEditKey(program)

  useInitOnModalOpen(open, editKey, () => {
    closingRef.current = false
    setForm(buildForm(programRef.current, programsRef.current))
    setErrors({})
  })

  useEffect(() => {
    if (!open) return
    setLoadingCourses(true)
    getCoursesCatalog()
      .then(setCatalog)
      .finally(() => setLoadingCourses(false))
  }, [open])

  const handleClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    setErrors({})
    onClose()
  }

  const handleReset = () => {
    setForm(buildForm(program, programs))
    setErrors({})
    toast.message('Form reset')
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Program name is required'
    if (!form.centerIds?.length) next.centers = 'Select at least one centre'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    onSubmit(
      {
        programId: form.programId,
        name: form.name.trim(),
        description: form.description,
        status: form.status,
        courseIds: form.courseIds,
        centerIds: form.centerIds,
      },
      { isEdit, id: program?.id },
    )
    handleClose()
  }

  if (!open) return null

  const title = isEdit ? 'Edit Program' : 'Add Program'

  return (
    <Modal open={open} onClose={handleClose} size="lg" title={title}>
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader
          title={title}
          onBack={handleClose}
          icon={LayoutGrid}
          iconClassName="text-[#246392]"
        />

        <div className="max-h-[min(72vh,640px)] space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <SectionBar title="Program Details" />

          <div className="space-y-4 rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6">
            <CourseFormField label="Program Name" required>
              <CourseInput
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (errors.name) setErrors((e) => ({ ...e, name: undefined }))
                }}
                placeholder="e.g. UPSC Complete Program"
                autoFocus
              />
            </CourseFormField>
            {errors.name && (
              <p className="text-xs font-medium text-[#dc2626]">{errors.name}</p>
            )}

            <CourseFormField label="Centre Name" required>
              <CentreMultiSelect
                centres={activeCenters}
                selectedIds={form.centerIds}
                onChange={(ids) => {
                  setForm((f) => ({ ...f, centerIds: ids }))
                  if (errors.centers) setErrors((e) => ({ ...e, centers: undefined }))
                }}
              />
            </CourseFormField>
            {errors.centers && (
              <p className="text-xs font-medium text-[#dc2626]">{errors.centers}</p>
            )}
          </div>

          <SectionBar title="Linked Courses" />

          <div className="rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6">
            <CourseMultiSelect
              courses={catalog}
              selectedIds={form.courseIds}
              onChange={(ids) => setForm((f) => ({ ...f, courseIds: ids }))}
              loading={loadingCourses}
            />
          </div>

          <FormModalSubmitBar
            isEditMode={isEdit}
            onReset={handleReset}
            createLabel="Create Program"
            updateLabel="Update Program"
          />
        </div>
      </form>
    </Modal>
  )
}
