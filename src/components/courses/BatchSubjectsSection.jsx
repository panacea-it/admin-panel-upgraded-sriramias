import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import SearchableSelect from '../categories/SearchableSelect'
import { CourseAddMoreLink, CourseFormField } from './CourseFormField'
import { formatSubjectLabel, loadSubjects } from '../../utils/subjectsStorage'
import { cn } from '../../utils/cn'

const emptyLink = () => ({ subjectId: '', subjectName: '' })

const selectTriggerClass = cn(
  'flex h-12 min-h-[48px] w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-left text-sm font-medium text-gray-800 shadow-sm outline-none transition',
  'hover:border-[#93c5fd] focus:ring-2 focus:ring-blue-400/35',
)

export default function BatchSubjectsSection({ form, setForm }) {
  const [catalog, setCatalog] = useState(() => loadSubjects())

  useEffect(() => {
    const refresh = () => setCatalog(loadSubjects())
    refresh()
    window.addEventListener('subjects-updated', refresh)
    return () => window.removeEventListener('subjects-updated', refresh)
  }, [])

  const linked = form.linkedSubjects?.length ? form.linkedSubjects : [emptyLink()]

  const usedIds = useMemo(
    () => new Set(linked.map((l) => l.subjectId).filter(Boolean)),
    [linked],
  )

  const subjectOptions = useMemo(
    () =>
      catalog.map((s) => ({
        value: s.subjectId || s.id,
        label: formatSubjectLabel(s),
      })),
    [catalog],
  )

  const findSubject = (subjectId) =>
    catalog.find((s) => (s.subjectId || s.id) === subjectId)

  const updateRow = (index, subjectId) => {
    const subject = findSubject(subjectId)
    setForm((f) => {
      const linkedSubjects = [...(f.linkedSubjects?.length ? f.linkedSubjects : [emptyLink()])]
      linkedSubjects[index] = {
        subjectId,
        subjectName: subject?.name || '',
      }
      return { ...f, linkedSubjects }
    })
  }

  const removeRow = (index) => {
    setForm((f) => {
      const linkedSubjects = [...(f.linkedSubjects || [])]
      linkedSubjects.splice(index, 1)
      return { ...f, linkedSubjects: linkedSubjects.length ? linkedSubjects : [emptyLink()] }
    })
  }

  const addRow = () => {
    setForm((f) => ({
      ...f,
      linkedSubjects: [...(f.linkedSubjects || []).filter((l) => l.subjectId), emptyLink()],
    }))
  }

  const optionsForRow = (index) => {
    const currentId = linked[index]?.subjectId
    return subjectOptions.filter(
      (o) => o.value === currentId || !usedIds.has(o.value),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {linked.filter((l) => l.subjectId).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {linked
            .filter((l) => l.subjectId)
            .map((l) => (
              <span
                key={l.subjectId}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#d4e4f4] bg-[#eef6fc] px-3 py-1.5 text-xs font-semibold text-[#246392]"
              >
                {formatSubjectLabel(l)}
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      linkedSubjects: (f.linkedSubjects || []).filter(
                        (x) => x.subjectId !== l.subjectId,
                      ),
                    }))
                  }}
                  className="rounded-full p-0.5 transition hover:bg-white/80"
                  aria-label={`Remove ${l.subjectName}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}

      <div className="flex flex-col gap-5">
        {linked.map((row, idx) => (
          <div
            key={`subject-row-${idx}`}
            className="grid gap-6 rounded-xl border border-gray-100 bg-[#fafcff] p-5 sm:grid-cols-2 lg:grid-cols-[1fr_minmax(140px,180px)] lg:items-end"
          >
            <CourseFormField label="Link Subject" className="min-w-0 sm:col-span-1 lg:col-span-1">
              <SearchableSelect
                options={optionsForRow(idx)}
                value={row.subjectId}
                onChange={(subjectId) => updateRow(idx, subjectId)}
                placeholder="Search subject..."
                emptyMessage={
                  catalog.length
                    ? 'No subjects available'
                    : 'Create subjects under Academics → Categories → Subject'
                }
                triggerClassName={selectTriggerClass}
              />
            </CourseFormField>
            <CourseFormField label="Subject ID" className="min-w-0">
              <div className="flex h-12 min-h-[48px] items-center justify-center rounded-xl border border-gray-200 bg-white px-4 font-mono text-sm font-semibold text-[#246392] shadow-sm">
                {row.subjectId || '—'}
              </div>
            </CourseFormField>
            {linked.length > 1 && row.subjectId ? (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="text-left text-xs font-semibold text-[#c96565] transition hover:underline sm:col-span-2 lg:col-span-2"
              >
                Remove row
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-5">
        <CourseAddMoreLink onClick={addRow} variant="pill" />
      </div>
    </div>
  )
}
