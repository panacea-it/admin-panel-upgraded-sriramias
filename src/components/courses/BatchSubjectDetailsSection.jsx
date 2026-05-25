import { useMemo, useState } from 'react'
import { GraduationCap, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CourseFormField, CourseSelect } from './CourseFormField'
import { facultySubjectLabels } from '../../data/facultySubjectLabels'
import { formatFacultySubjectOption } from '../../utils/subjectProvisioning'
import { normalizeLinkedSubjects } from '../../utils/batchHelpers'
import { cn } from '../../utils/cn'

function SubjectChip({ subjectId, subjectName, onRemove }) {
  const label = formatFacultySubjectOption({ id: subjectId, subjectName })
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.15 }}
      className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#cfe8f7] bg-white px-3 py-2 text-sm font-medium text-[#1a3a5c] shadow-sm ring-1 ring-[#eef2fc] transition-shadow hover:shadow-md"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef6fc] text-[10px] font-bold text-[#246392]">
        {String(subjectId).slice(-3)}
      </span>
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg p-1 text-[#246392] transition hover:bg-[#eef6fc]"
        aria-label={`Remove ${subjectName}`}
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </motion.span>
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
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-[#eef2fc] bg-[#f8fbff] px-4 py-3.5">
        <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#246392]" strokeWidth={2.1} />
        <p className="text-sm leading-relaxed text-[#686868]">
          Add one or more {facultySubjectLabels.plural.toLowerCase()} to this batch. Each entry
          stores subject ID and name.
        </p>
      </div>

      <CourseFormField label={`Add ${facultySubjectLabels.singular} (ID · Name)`}>
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
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#246392]">
            Selected subjects ({linkedSubjects.length})
          </p>
          <div className="flex flex-wrap gap-2.5 rounded-xl border border-[#eef2fc] bg-gradient-to-b from-[#fafcff] to-white p-4">
            <AnimatePresence mode="popLayout">
              {linkedSubjects.map((s) => (
                <SubjectChip
                  key={s.subjectId}
                  subjectId={s.subjectId}
                  subjectName={s.subjectName}
                  onRemove={() => removeSubject(s.subjectId)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-dashed border-[#cfe8f7]',
            'bg-[#fafcff] px-6 py-10 text-center transition-colors',
          )}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fc] ring-1 ring-[#cfe8f8]">
            <GraduationCap className="h-6 w-6 text-[#246392]" />
          </div>
          <p className="text-sm font-semibold text-[#1a3a5c]">No subjects added yet</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#686868]">
            Use the dropdown above to attach subjects to this batch.
          </p>
        </div>
      )}
    </div>
  )
}
