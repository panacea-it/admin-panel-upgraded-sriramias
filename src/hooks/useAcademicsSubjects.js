import { useCallback, useEffect, useState } from 'react'
import {
  loadAcademicsSubjects,
  saveAcademicsSubjects,
} from '../utils/academicsSubjectsStorage'

export function useAcademicsSubjects() {
  const [subjects, setSubjects] = useState(() => loadAcademicsSubjects())

  const persist = useCallback((next) => {
    setSubjects(next)
    saveAcademicsSubjects(next)
  }, [])

  useEffect(() => {
    const refresh = () => setSubjects(loadAcademicsSubjects())
    window.addEventListener('academics-subjects-updated', refresh)
    return () => window.removeEventListener('academics-subjects-updated', refresh)
  }, [])

  const getSubjectById = useCallback(
    (id) => subjects.find((s) => String(s.id) === String(id)),
    [subjects],
  )

  const upsertSubject = useCallback(
    (row) => {
      persist(
        subjects.some((s) => s.id === row.id)
          ? subjects.map((s) => (s.id === row.id ? row : s))
          : [...subjects, row],
      )
    },
    [persist, subjects],
  )

  const deleteSubject = useCallback(
    (id) => {
      persist(subjects.filter((s) => s.id !== id))
    },
    [persist, subjects],
  )

  const upsertLiveClass = useCallback(
    (subjectId, liveClass) => {
      persist(
        subjects.map((s) => {
          if (s.id !== subjectId) return s
          const list = s.liveClasses || []
          const exists = list.some((lc) => lc.id === liveClass.id)
          const liveClasses = exists
            ? list.map((lc) => (lc.id === liveClass.id ? liveClass : lc))
            : [...list, liveClass]
          return { ...s, liveClasses }
        }),
      )
    },
    [persist, subjects],
  )

  const deleteLiveClass = useCallback(
    (subjectId, liveClassId) => {
      persist(
        subjects.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            liveClasses: (s.liveClasses || []).filter((lc) => lc.id !== liveClassId),
          }
        }),
      )
    },
    [persist, subjects],
  )

  return {
    subjects,
    setSubjects: persist,
    getSubjectById,
    upsertSubject,
    deleteSubject,
    upsertLiveClass,
    deleteLiveClass,
  }
}
