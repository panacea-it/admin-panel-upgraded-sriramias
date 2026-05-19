import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  deleteLiveClass as apiDelete,
  fetchLiveClasses,
  saveLiveClass as apiSave,
} from '../api/liveClassesAPI'
import { lessonFormToRow } from '../utils/liveClassesMappers'
import { toast } from '../utils/toast'

const LiveClassesContext = createContext(null)

export function LiveClassesProvider({ children }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLiveClasses()
      setLessons(data)
    } catch (err) {
      setError(err?.message || 'Failed to load live classes')
      toast.error('Could not load live classes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveLesson = useCallback(async (form, { isEdit, id }) => {
    const existing = isEdit ? lessons.find((l) => l.id === id) : null
    const row = lessonFormToRow(form, existing)
    const saved = await apiSave(row, { isEdit, id })
    setLessons((prev) => {
      if (isEdit && id) return prev.map((l) => (l.id === id ? saved : l))
      return [saved, ...prev]
    })
    return saved
  }, [lessons])

  const removeLesson = useCallback(async (id) => {
    await apiDelete(id)
    setLessons((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const toggleDisabled = useCallback((id) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: l.status === 'Disabled' ? 'Scheduled' : 'Disabled',
              modifiedAt: new Date().toISOString(),
            }
          : l,
      ),
    )
  }, [])

  const rescheduleLesson = useCallback((id, { scheduledDate, scheduledTime }) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              scheduledDate,
              scheduledTime,
              modifiedAt: new Date().toISOString(),
            }
          : l,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      lessons,
      loading,
      error,
      reload: load,
      saveLesson,
      removeLesson,
      toggleDisabled,
      rescheduleLesson,
    }),
    [lessons, loading, error, load, saveLesson, removeLesson, toggleDisabled, rescheduleLesson],
  )

  return (
    <LiveClassesContext.Provider value={value}>{children}</LiveClassesContext.Provider>
  )
}

export function useLiveClasses() {
  const ctx = useContext(LiveClassesContext)
  if (!ctx) throw new Error('useLiveClasses must be used within LiveClassesProvider')
  return ctx
}
