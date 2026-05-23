import { useCallback, useState } from 'react'

/**
 * Shared create/edit modal state for academics (and similar) list pages.
 */
export function useEditModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const openCreate = useCallback(() => {
    setSelectedItem(null)
    setIsEditMode(false)
    setIsOpen(true)
  }, [])

  const openEdit = useCallback((row) => {
    setSelectedItem(row)
    setIsEditMode(true)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setIsEditMode(false)
    setSelectedItem(null)
  }, [])

  return {
    isOpen,
    isEditMode,
    selectedItem,
    openCreate,
    openEdit,
    close,
  }
}
