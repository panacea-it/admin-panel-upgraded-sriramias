import { useCallback, useEffect, useRef, useState } from 'react'

const INTERVAL_MS = 30_000
const DEBOUNCE_MS = 2_000

/**
 * Auto-save blog drafts while the modal is open.
 * @returns {{ saveState: 'idle'|'saving'|'saved', lastSavedLabel: string, triggerSave: () => void }}
 */
export default function useBlogAutoSave({ open, form, onAutoSave, enabled = true }) {
  const [saveState, setSaveState] = useState('idle')
  const [lastSavedAt, setLastSavedAt] = useState(form?.lastSavedAt)
  const formRef = useRef(form)
  const savingRef = useRef(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    formRef.current = form
  }, [form])

  const runSave = useCallback(async () => {
    if (!enabled || !open || savingRef.current) return
    const current = formRef.current
    if (!current?.title?.trim()) return

    savingRef.current = true
    setSaveState('saving')
    try {
      const saved = await onAutoSave?.(current)
      const ts = saved?.lastSavedAt || new Date().toISOString()
      setLastSavedAt(ts)
      setSaveState('saved')
    } catch {
      setSaveState('idle')
    } finally {
      savingRef.current = false
    }
  }, [enabled, open, onAutoSave])

  useEffect(() => {
    if (!open || !enabled) return undefined

    const interval = setInterval(runSave, INTERVAL_MS)
    return () => clearInterval(interval)
  }, [open, enabled, runSave])

  useEffect(() => {
    if (!open || !enabled) return undefined

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(runSave, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [form, open, enabled, runSave])

  useEffect(() => {
    if (!open) {
      setSaveState('idle')
    }
  }, [open])

  useEffect(() => {
    if (form?.lastSavedAt) setLastSavedAt(form.lastSavedAt)
  }, [form?.lastSavedAt])

  const lastSavedLabel = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : ''

  return { saveState, lastSavedLabel, triggerSave: runSave }
}
