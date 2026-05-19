import { useEffect, useState } from 'react'

/**
 * Syncs modal form state when opened for create vs edit.
 */
export function useModalForm(open, item, rowToForm, createEmpty) {
  const isEditMode = Boolean(item?.id)
  const [form, setForm] = useState(createEmpty)
  const [initialSnapshot, setInitialSnapshot] = useState(null)

  useEffect(() => {
    if (!open) return
    const next = item ? rowToForm(item) : createEmpty()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional prefill on open
    setForm(next)
    setInitialSnapshot(structuredClone(next))
  }, [open, item])

  const reset = () => {
    setForm(initialSnapshot ? structuredClone(initialSnapshot) : createEmpty())
  }

  const clear = () => {
    setForm(createEmpty())
    setInitialSnapshot(null)
  }

  return { form, setForm, isEditMode, reset, clear }
}
