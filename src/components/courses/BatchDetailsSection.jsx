import {
  CourseDateInput,
  CourseFormField,
  CourseInput,
} from './CourseFormField'
import BannerImageUpload from './BannerImageUpload'

export default function BatchDetailsSection({
  form,
  setForm,
  errors,
  setErrors,
}) {
  const clearError = (key) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validateDates = (start, end) => {
    if (start && end && end < start) {
      setErrors((e) => ({ ...e, batchEndTo: 'End date cannot be before start date' }))
      return false
    }
    if (errors.batchEndTo?.includes('before')) {
      setErrors((e) => ({ ...e, batchEndTo: undefined }))
    }
    return true
  }

  const fieldError = (key) =>
    errors[key] ? (
      <p className="text-xs font-medium text-red-600">{errors[key]}</p>
    ) : null

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <CourseFormField label="Batch Name" required className="sm:col-span-2 lg:col-span-3">
        <CourseInput
          value={form.batchName}
          onChange={(e) => {
            setForm((f) => ({ ...f, batchName: e.target.value }))
            clearError('batchName')
          }}
          placeholder="e.g. UPSC Batch 1"
        />
        {fieldError('batchName')}
      </CourseFormField>

      <CourseFormField label="Course ID" required>
        <CourseInput
          value={form.courseId}
          onChange={(e) => {
            setForm((f) => ({ ...f, courseId: e.target.value.toUpperCase() }))
            clearError('courseId')
          }}
          placeholder="CRS001"
          className="font-mono"
        />
        {fieldError('courseId')}
      </CourseFormField>

      <CourseFormField label="Date of Commencement" required>
        <CourseDateInput
          value={form.commencement}
          onChange={(e) => {
            setForm((f) => ({ ...f, commencement: e.target.value }))
            clearError('commencement')
          }}
        />
        {fieldError('commencement')}
      </CourseFormField>

      <CourseFormField label="Duration" required className="sm:col-span-2 lg:col-span-1">
        <CourseInput
          value={form.durationLabel}
          onChange={(e) => {
            setForm((f) => ({ ...f, durationLabel: e.target.value }))
            clearError('durationLabel')
          }}
          placeholder="e.g. 6 Months, 1 Year"
        />
        {fieldError('durationLabel')}
      </CourseFormField>

      <CourseFormField label="Batch Start Date" required>
        <CourseDateInput
          value={form.batchStartFrom}
          onChange={(e) => {
            const batchStartFrom = e.target.value
            setForm((f) => ({ ...f, batchStartFrom }))
            clearError('batchStartFrom')
            validateDates(batchStartFrom, form.batchEndTo)
          }}
        />
        {fieldError('batchStartFrom')}
      </CourseFormField>

      <CourseFormField label="Batch End Date" required>
        <CourseDateInput
          value={form.batchEndTo}
          onChange={(e) => {
            const batchEndTo = e.target.value
            setForm((f) => ({ ...f, batchEndTo }))
            clearError('batchEndTo')
            validateDates(form.batchStartFrom, batchEndTo)
          }}
        />
        {fieldError('batchEndTo')}
      </CourseFormField>

      <CourseFormField label="Banner Image" required className="sm:col-span-2 lg:col-span-3">
        <BannerImageUpload
          previewUrl={form.bannerPreview}
          fileName={form.bannerFileName}
          error={errors.bannerPreview}
          onChange={({ file, previewUrl, fileName }) => {
            setForm((f) => ({
              ...f,
              bannerPreview: previewUrl,
              bannerFileName: fileName,
              bannerUrl: previewUrl,
            }))
            clearError('bannerPreview')
          }}
        />
      </CourseFormField>
    </div>
  )
}
