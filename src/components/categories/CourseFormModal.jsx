import { useEffect, useMemo, useRef, useState } from 'react'
import { getModalEditKey, useInitOnModalOpen } from '../../hooks/modalFormSync'
import { BookOpen } from 'lucide-react'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import { CourseFormField, CourseInput } from '../courses/CourseFormField'
import SearchableSelect from './SearchableSelect'
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

function buildForm(item, programs, examCategories) {
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

export default function CourseFormModal({ open, onClose, item, onSubmit }) {
  const isEdit = Boolean(item)
  const { activeCenters } = useCenters()
  const [programs, setPrograms] = useState(() => loadPrograms(activeCenters))
  const [examCategories, setExamCategories] = useState(() => loadExamCategories())
  const [examSubCategories, setExamSubCategories] = useState(() => loadExamSubCategories())
  const [form, setForm] = useState(() => buildForm(null, [], []))
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
    setForm(buildForm(itemRef.current, programsRef.current, examCategoriesRef.current))
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
    setErrors((e) => ({
      ...e,
      centerId: undefined,
      programId: undefined,
      examCategoryId: undefined,
      examSubCategoryId: undefined,
    }))
  }

  const validate = () => {
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
    if (!validate()) {
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
      },
      { isEdit, id: item?.id },
    )
    handleClose()
  }

  if (!open) return null

  const title = isEdit ? 'Edit Course' : 'Add Course'

  return (
    <Modal open={open} onClose={handleClose} size="md" title={title}>
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-[#f0f4f8] shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <ModalPanelHeader
          title={title}
          onBack={handleClose}
          icon={BookOpen}
          iconClassName="text-[#246392]"
        />

        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          <SectionBar title="Course Details" />

          <div className="grid gap-4 rounded-xl bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:grid-cols-2 sm:px-6 sm:py-6">
            <CourseFormField label="Course Name" required>
              <CourseInput
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (errors.name) setErrors((err) => ({ ...err, name: undefined }))
                }}
                placeholder="e.g. GS Foundation Batch"
              />
            </CourseFormField>
            {errors.name && (
              <p className="text-xs font-medium text-[#dc2626]">{errors.name}</p>
            )}

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
            {errors.centerId && (
              <p className="text-xs font-medium text-[#dc2626] sm:col-start-2">{errors.centerId}</p>
            )}

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
                  setErrors((e) => ({
                    ...e,
                    programId: undefined,
                    examCategoryId: undefined,
                    examSubCategoryId: undefined,
                  }))
                }}
                placeholder={form.centerId ? 'Select program' : 'Select centre first'}
                emptyMessage={
                  form.centerId
                    ? 'No programs for this centre'
                    : 'Select a centre first'
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
                  setErrors((e) => ({
                    ...e,
                    examCategoryId: undefined,
                    examSubCategoryId: undefined,
                  }))
                }}
                placeholder={
                  form.programId ? 'Select exam category' : 'Select program first'
                }
                emptyMessage={
                  form.programId
                    ? 'No exam categories for this centre & program'
                    : 'Select a program first'
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
                  if (errors.examSubCategoryId) {
                    setErrors((e) => ({ ...e, examSubCategoryId: undefined }))
                  }
                }}
                placeholder={
                  form.examCategoryId ? 'Select subcategory' : 'Select exam category first'
                }
                emptyMessage={
                  form.examCategoryId
                    ? 'No subcategories for this centre & category'
                    : 'Select an exam category first'
                }
                disabled={!form.examCategoryId}
                error={errors.examSubCategoryId}
              />
            </CourseFormField>
          </div>

          <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[#e5eaf2] bg-[#f0f4f8]/95 pt-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={handleClose}
              className="min-w-[100px] rounded-lg border border-[#d4e4f4] bg-white px-6 py-2.5 text-sm font-semibold text-[#444] transition hover:bg-[#f8fbff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-w-[120px] rounded-lg bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Save Course
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
