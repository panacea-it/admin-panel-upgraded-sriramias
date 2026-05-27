import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { DoorOpen } from 'lucide-react'
import Modal from '../ui/Modal'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import ClassroomLocationSelector from '../academics/ClassroomLocationSelector'
import { CourseFormField, CourseInput, CourseSelect } from '../courses/CourseFormField'
import { getModalEditKey, useInitOnModalOpen } from '../../hooks/modalFormSync'
import { findCityById } from '../../utils/citiesStorage'
import { useCenters } from '../../contexts/CentersContext'
import { toast } from '../../utils/toast'
import { cn } from '../../utils/cn'

const EMPTY = {
  centerId: '',
  cityPlaceId: '',
  name: '',
  code: '',
  capacity: '',
  status: 'Active',
}

function classroomToForm(classroom) {
  if (!classroom) return { ...EMPTY }
  return {
    centerId: classroom.centerId || '',
    cityPlaceId: classroom.cityPlaceId || '',
    name: classroom.name || '',
    code: classroom.code || '',
    capacity: classroom.capacity ?? '',
    status: classroom.status || 'Active',
  }
}

const fieldClass = cn(
  'h-11 w-full rounded-xl bg-[#d1e9f6] px-4 text-sm outline-none',
  'focus:ring-2 focus:ring-[#55ace7]/40',
)

export default function ClassroomFormModal({ open, onClose, classroom, onSave, saving }) {
  const isEdit = Boolean(classroom)
  const { activeCenters } = useCenters()
  const classroomRef = useRef(classroom)
  classroomRef.current = classroom
  const editKey = getModalEditKey(classroom)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY })

  const centerId = watch('centerId')
  const cityPlaceId = watch('cityPlaceId')
  const name = watch('name')

  useInitOnModalOpen(open, editKey, () => {
    reset(classroomToForm(classroomRef.current))
    clearErrors()
  })

  const onSubmit = async (values) => {
    const centre = activeCenters.find((c) => String(c.centerId) === String(values.centerId))
    const city = values.cityPlaceId ? findCityById(values.cityPlaceId) : null
    if (!centre) {
      setError('centerId', { message: 'Centre is required' })
      return
    }
    if (!city) {
      setError('cityPlaceId', { message: 'City / place is required' })
      return
    }
    try {
      await onSave({
        ...values,
        centerName: centre.centerName,
        placeName: city.placeName,
        description: classroomRef.current?.description || '',
        color: classroomRef.current?.color,
      })
    } catch (e) {
      if (e.validation) {
        Object.entries(e.validation).forEach(([key, message]) => {
          setError(key, { message })
        })
      }
    }
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} size="md">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-h-[min(90vh,820px)] flex-col overflow-hidden rounded-2xl bg-[#f0f4f8]"
      >
        <ModalPanelHeader
          icon={DoorOpen}
          title={isEdit ? 'Edit Classroom' : 'Add Classroom'}
          subtitle="Manage room details and capacity"
          onBack={onClose}
        />

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
          <ClassroomLocationSelector
            centerId={centerId}
            cityPlaceId={cityPlaceId}
            classroomName={name}
            onCenterChange={(id) => {
              setValue('centerId', id, { shouldDirty: true })
              setValue('cityPlaceId', '', { shouldDirty: true })
              clearErrors(['centerId', 'cityPlaceId'])
            }}
            onCityChange={(id) => {
              setValue('cityPlaceId', id, { shouldDirty: true })
              clearErrors('cityPlaceId')
            }}
            errors={{
              centerId: errors.centerId?.message,
              cityPlaceId: errors.cityPlaceId?.message,
            }}
          />

          <CourseFormField label="Classroom Name" required>
            <CourseInput
              {...register('name', { required: 'Classroom name is required' })}
              placeholder="e.g. Class Room 1"
              className={fieldClass}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </CourseFormField>

          <CourseFormField label="Classroom Code / Room Number" required>
            <CourseInput
              {...register('code', { required: 'Classroom code is required' })}
              placeholder="e.g. CR-01"
              className={cn(fieldClass, 'uppercase')}
            />
            {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
          </CourseFormField>

          <CourseFormField label="Capacity (optional)">
            <CourseInput
              type="number"
              min={1}
              {...register('capacity')}
              placeholder="e.g. 40"
              className={fieldClass}
            />
            {errors.capacity && (
              <p className="text-xs text-red-500">{errors.capacity.message}</p>
            )}
          </CourseFormField>

          <CourseFormField label="Status">
            <CourseSelect {...register('status')}>
              <option value="Active">Active</option>
              <option value="In Active">In Active</option>
            </CourseSelect>
          </CourseFormField>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200/80 bg-[#f0f4f8] px-5 pb-5 pt-4 sm:px-6">
          <FormModalSubmitBar
            isEditMode={isEdit}
            onReset={() => {
              reset(classroomToForm(classroomRef.current))
              clearErrors()
              toast.message('Form reset')
            }}
            createLabel={saving ? 'Saving…' : 'Save'}
            updateLabel={saving ? 'Saving…' : 'Update'}
            resetLabel="Reset"
          />
        </div>
      </form>
    </Modal>
  )
}
