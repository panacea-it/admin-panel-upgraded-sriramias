import { useEffect, useMemo, useRef, useState } from 'react'
import { getModalEditKey, useInitOnModalOpen } from '../../hooks/modalFormSync'
import { BookOpen } from 'lucide-react'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import { CourseFormField, CourseInput } from '../courses/CourseFormField'
import SearchableSelect from './SearchableSelect'
import CourseMarketingSections from './CourseMarketingSections'
import { useCenters } from '../../contexts/CentersContext'
import {
  formatExamCategoryLabel,
  getExamCategoriesForCentreAndProgram,
  loadExamCategories,
} from '../../utils/examCategoriesStorage'
import {
  formatExamSubCategoryLabel,
  getExamSubCategoriesForCentreAndCategory,
  loadExamSubCategories,
} from '../../utils/examSubCategoriesStorage'
import {
  formatProgramLabel,
  getProgramsForCentre,
  loadPrograms,
} from '../../utils/programsStorage'
import {
  academicCourseItemToContent,
  createEmptyAcademicCourseContent,
  serializeAcademicCourseContent,
  validateAcademicCourseContent,
} from '../../utils/academicCourseForm'
import { toast } from '../../utils/toast'

function resolveCenterIdFromItem(item, programs, examCategories) {
  if (!item) return ''
  if (item.centerId) return String(item.centerId)
  const category = examCategories.find(
    (c) => (c.categoryId || c.id) === item.examCategoryId,
  )
  if (category?.centerId) return String(category.centerId)
  const program = programs.find((p) => (p.programId || p.id) === item.programId)
  return program?.centerIds?.[0] ? String(program.centerIds[0]) : ''
}

function buildHierarchyForm(item, programs, examCategories) {
  if (item) {
    return {
      name: item.name || '',
      centerId: resolveCenterIdFromItem(item, programs, examCategories),
      programId: item.programId || '',
      examCategoryId: item.examCategoryId || '',
      examSubCategoryId: item.examSubCategoryId || '',
      status: item.status || 'Active',
    }
  }
  return {
    name: '',
    centerId: '',
    programId: '',
    examCategoryId: '',
    examSubCategoryId: '',
    status: 'Active',
  }
}

function buildFullForm(item, programs, examCategories) {
  return {
    ...buildHierarchyForm(item, programs, examCategories),
    ...academicCourseItemToContent(item),
  }
}

export default function CourseFormModal({ open, onClose, item, onSubmit }) {
  const isEdit = Boolean(item)
  const { activeCenters } = useCenters()
  const [programs, setPrograms] = useState(() => loadPrograms(activeCenters))
  const [examCategories, setExamCategories] = useState(() => loadExamCategories())
  const [examSubCategories, setExamSubCategories] = useState(() => loadExamSubCategories())
  const [form, setForm] = useState(() => ({
    ...buildHierarchyForm(null, [], []),
    ...createEmptyAcademicCourseContent(),
  }))
  const [errors, setErrors] = useState({})
  const closingRef = useRef(false)
  const itemRef = useRef(item)
  itemRef.current = item
  const programsRef = useRef(programs)
  programsRef.current = programs
  const examCategoriesRef = useRef(examCategories)
  examCategoriesRef.current = examCategories
  const editKey = getModalEditKey(item)

  useEffect(() => {
    const refreshPrograms = () => setPrograms(loadPrograms(activeCenters))
    const refreshCategories = () => setExamCategories(loadExamCategories())
    const refreshSubCategories = () => setExamSubCategories(loadExamSubCategories())
    refreshPrograms()
    refreshCategories()
    refreshSubCategories()
    window.addEventListener('programs-updated', refreshPrograms)
    window.addEventListener('exam-categories-updated', refreshCategories)
    window.addEventListener('exam-subcategories-updated', refreshSubCategories)
    return () => {
      window.removeEventListener('programs-updated', refreshPrograms)
      window.removeEventListener('exam-categories-updated', refreshCategories)
      window.removeEventListener('exam-subcategories-updated', refreshSubCategories)
    }
  }, [activeCenters])

  useInitOnModalOpen(open, editKey, () => {
    closingRef.current = false
    setForm(buildFullForm(itemRef.current, programsRef.current, examCategoriesRef.current))
    setErrors({})
  })

  const centreOptions = useMemo(
    () =>
      activeCenters.map((c) => ({
        value: String(c.centerId),
        label: c.centerName,
      })),
    [activeCenters],
  )

  const programsForCentre = useMemo(
    () => getProgramsForCentre(programs, form.centerId),
    [programs, form.centerId],
  )

  const programOptions = useMemo(
    () =>
      programsForCentre.map((p) => ({
        value: p.programId || p.id,
        label: formatProgramLabel(p),
      })),
    [programsForCentre],
  )

  const categoriesForSelection = useMemo(
    () =>
      getExamCategoriesForCentreAndProgram(
        examCategories,
        form.centerId,
        form.programId,
      ),
    [examCategories, form.centerId, form.programId],
  )

  const examCategoryOptions = useMemo(
    () =>
      categoriesForSelection.map((c) => ({
        value: c.categoryId || c.id,
        label: formatExamCategoryLabel(c),
      })),
    [categoriesForSelection],
  )

  const subCategoriesForSelection = useMemo(
    () =>
      getExamSubCategoriesForCentreAndCategory(
        examSubCategories,
        form.centerId,
        form.examCategoryId,
      ),
    [examSubCategories, form.centerId, form.examCategoryId],
  )

  const examSubCategoryOptions = useMemo(
    () =>
      subCategoriesForSelection.map((s) => ({
        value: s.subcategoryId || s.id,
        label: formatExamSubCategoryLabel(s),
      })),
    [subCategoriesForSelection],
  )

  const handleClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    setErrors({})
    onClose()
  }

  const handleCentreChange = (centerId) => {
    setForm((f) => ({
      ...f,
      centerId,
      programId: '',
      examCategoryId: '',
      examSubCategoryId: '',
    }))
    setErrors({})
  }

  const validateHierarchy = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Course name is required'
    if (!form.centerId) next.centerId = 'Centre is required'
    if (!form.programId) next.programId = 'Program is required'
    if (!form.examCategoryId) next.examCategoryId = 'Exam category is required'
    if (!form.examSubCategoryId) next.examSubCategoryId = 'Exam subcategory is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const hierarchyOk = validateHierarchy()
    const contentErrs = validateAcademicCourseContent(form, { courseName: form.name })
    if (!hierarchyOk || Object.keys(contentErrs).length) {
      toast.error('Please fix the highlighted fields')
      return
    }

    const centre = activeCenters.find((c) => String(c.centerId) === String(form.centerId))
    const program = programsForCentre.find((p) => (p.programId || p.id) === form.programId)
    const category = categoriesForSelection.find(
      (c) => (c.categoryId || c.id) === form.examCategoryId,
    )
    const sub = subCategoriesForSelection.find(
      (s) => (s.subcategoryId || s.id) === form.examSubCategoryId,
    )

    onSubmit(
      {
        name: form.name.trim(),
        centerId: form.centerId,
        centerName: centre?.centerName || '',
        programId: form.programId,
        program: formatProgramLabel(program),
        examCategoryId: form.examCategoryId,
        examCategory: formatExamCategoryLabel(category),
        examSubCategoryId: form.examSubCategoryId,
        examSubCategory: formatExamSubCategoryLabel(sub),
        status: form.status,
        ...serializeAcademicCourseContent(form, {
          examCategory: formatExamCategoryLabel(category),
          courseName: form.name.trim(),
        }),
      },
      { isEdit, id: item?.id },
    )
    handleClose()
  }

  if (!open) return null

  const title = isEdit ? 'Edit Course' : 'Add Course'

  return (
    <Modal open={open} onClose={handleClose} size="full" title={title}>
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[min(92vh,820px)] flex-col overflow-hidden rounded-2xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader
          title={title}
          onBack={handleClose}
          icon={BookOpen}
          iconClassName="text-[#246392]"
        />

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-7">
          <div className="space-y-6">
            <SectionBar title="Course Details" />
            <div className="grid gap-4 rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:grid-cols-2 sm:px-6 sm:py-6">
              <CourseFormField label="Course Name" required>
                <CourseInput
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }))
                    if (errors.name) setErrors((err) => ({ ...err, name: undefined }))
                  }}
                  placeholder="e.g. UPSC Foundation"
                />
                {errors.name && (
                  <p className="text-xs font-medium text-[#dc2626]">{errors.name}</p>
                )}
              </CourseFormField>

              <CourseFormField label="Center" required>
                <SearchableSelect
                  options={centreOptions}
                  value={form.centerId}
                  onChange={handleCentreChange}
                  placeholder="Select centre"
                  emptyMessage="No centres available"
                  error={errors.centerId}
                />
              </CourseFormField>

              <CourseFormField label="Program" required>
                <SearchableSelect
                  options={programOptions}
                  value={form.programId}
                  onChange={(programId) => {
                    setForm((f) => ({
                      ...f,
                      programId,
                      examCategoryId: '',
                      examSubCategoryId: '',
                    }))
                    setErrors({})
                  }}
                  placeholder={form.centerId ? 'Select program' : 'Select centre first'}
                  emptyMessage={
                    form.centerId ? 'No programs for this centre' : 'Select a centre first'
                  }
                  disabled={!form.centerId}
                  error={errors.programId}
                />
              </CourseFormField>

              <CourseFormField label="Exam Category" required>
                <SearchableSelect
                  options={examCategoryOptions}
                  value={form.examCategoryId}
                  onChange={(examCategoryId) => {
                    setForm((f) => ({ ...f, examCategoryId, examSubCategoryId: '' }))
                    setErrors({})
                  }}
                  placeholder={
                    form.programId ? 'Select exam category' : 'Select program first'
                  }
                  disabled={!form.programId}
                  error={errors.examCategoryId}
                />
              </CourseFormField>

              <CourseFormField label="Exam Subcategory" required className="sm:col-span-2">
                <SearchableSelect
                  options={examSubCategoryOptions}
                  value={form.examSubCategoryId}
                  onChange={(examSubCategoryId) => {
                    setForm((f) => ({ ...f, examSubCategoryId }))
                    setErrors({})
                  }}
                  placeholder={
                    form.examCategoryId ? 'Select subcategory' : 'Select exam category first'
                  }
                  disabled={!form.examCategoryId}
                  error={errors.examSubCategoryId}
                />
              </CourseFormField>
            </div>
          </div>

          <CourseMarketingSections
            form={form}
            setForm={setForm}
            courseName={form.name}
          />
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-[#e5eaf2] bg-[#f0f4f8]/95 px-4 py-5 backdrop-blur-md sm:px-8">
          <FormModalSubmitBar
            isEditMode={isEdit}
            onReset={() => {
              setForm(buildFullForm(item, programs, examCategories))
              setErrors({})
            }}
            createLabel="Create"
            updateLabel="Update"
            className="border-t-0 pt-4"
          />
        </div>
      </form>
    </Modal>
  )
}
