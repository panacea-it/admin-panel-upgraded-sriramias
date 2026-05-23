import { useMemo, useState } from 'react'
import { GraduationCap, X } from 'lucide-react'
import SectionBar from './SectionBar'
import { CourseFormField, CourseSelect } from './CourseFormField'
import { facultySubjectLabels } from '../../data/facultySubjectLabels'
import { formatFacultySubjectOption } from '../../utils/subjectProvisioning'
import { normalizeLinkedSubjects } from '../../utils/batchHelpers'

function SubjectChip({ subjectId, subjectName, onRemove }) {
  const label = formatFacultySubjectOption({ id: subjectId, subjectName })
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f4fc] px-3 py-1.5 text-sm font-medium text-[#1a3a5c] ring-1 ring-[#93c5fd]/40">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-[#246392] transition hover:bg-[#d9ebf9]"
        aria-label={`Remove ${subjectName}`}
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </span>
  )
}

/** Multi-select faculty subjects (ID · name) for Add/Edit Batch */
export default function BatchSubjectDetailsSection({ form, setForm, subjects = [] }) {
  const [pickerKey, setPickerKey] = useState(0)
  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.status !== 'In Active'),
    [subjects],
  )

  const linkedSubjects = useMemo(
    () => normalizeLinkedSubjects(form),
    [form],
  )

  const selectedIds = useMemo(
    () => new Set(linkedSubjects.map((s) => String(s.subjectId))),
    [linkedSubjects],
  )

  const availableToAdd = useMemo(
    () => activeSubjects.filter((s) => !selectedIds.has(String(s.id))),
    [activeSubjects, selectedIds],
  )

  const addSubject = (subjectId) => {
    if (!subjectId) return
    const subject = activeSubjects.find((s) => String(s.id) === String(subjectId))
    if (!subject || selectedIds.has(String(subjectId))) return
    setForm((f) => ({
      ...f,
      linkedSubjects: [
        ...normalizeLinkedSubjects(f),
        { subjectId: String(subject.id), subjectName: subject.subjectName || '' },
      ],
    }))
  }

  const removeSubject = (subjectId) => {
    setForm((f) => ({
      ...f,
      linkedSubjects: normalizeLinkedSubjects(f).filter(
        (s) => String(s.subjectId) !== String(subjectId),
      ),
    }))
  }

  return (
    <div className="space-y-4">
      <SectionBar title="Subject Details" />
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6">
        <div className="flex items-start gap-2">
          <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-[#246392]" />
          <p className="text-sm text-[#686868]">
            Add one or more {facultySubjectLabels.plural.toLowerCase()} to this batch. Each entry
            stores subject ID and name.
          </p>
        </div>

        <CourseFormField
          label={`Add ${facultySubjectLabels.singular} (ID · Name)`}
          className="mt-4"
        >
          <CourseSelect
            key={pickerKey}
            value=""
            onChange={(e) => {
              addSubject(e.target.value)
              setPickerKey((k) => k + 1)
            }}
            disabled={availableToAdd.length === 0}
          >
            <option value="">
              {availableToAdd.length
                ? 'Select subject to add'
                : activeSubjects.length
                  ? 'All subjects already added'
                  : 'No subjects available'}
            </option>
            {availableToAdd.map((s) => (
              <option key={s.id} value={s.id}>
                {formatFacultySubjectOption(s)}
              </option>
            ))}
          </CourseSelect>
        </CourseFormField>

        {linkedSubjects.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#246392]">
              Selected subjects ({linkedSubjects.length})
            </p>
            <div className="flex flex-wrap gap-2 rounded-xl border border-[#eef2fc] bg-[#fafcff] p-3">
              {linkedSubjects.map((s) => (
                <SubjectChip
                  key={s.subjectId}
                  subjectId={s.subjectId}
                  subjectName={s.subjectName}
                  onRemove={() => removeSubject(s.subjectId)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-[#cfe8f7] bg-[#fafcff] px-4 py-6 text-center text-sm text-[#686868]">
            No subjects added yet. Use the dropdown above to add subjects.
          </p>
        )}
      </div>
    </div>
  )
}
