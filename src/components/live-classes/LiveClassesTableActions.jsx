import { Copy, Eye, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '../../utils/cn'

export default function LiveClassesTableActions({
  row,
  onView,
  onEdit,
  onDelete,
  onDisable,
  onDuplicate,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const items = [
    { label: 'View', icon: Eye, onClick: () => onView?.(row) },
    { label: 'Edit', icon: Pencil, onClick: () => onEdit?.(row) },
    { label: 'Duplicate', icon: Copy, onClick: () => onDuplicate?.(row) },
    {
      label: row.status === 'Disabled' ? 'Enable' : 'Disable',
      icon: Power,
      onClick: () => onDisable?.(row),
    },
    { label: 'Delete', icon: Trash2, onClick: () => onDelete?.(row), danger: true },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#686868] transition hover:bg-[#eef2fc] hover:text-[#246392]"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-[#e8f4fc] bg-white py-1 shadow-[0_12px_32px_rgba(36,99,146,0.15)]">
          {items.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                onClick()
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium transition hover:bg-[#eef2fc]',
                danger ? 'text-[#c96565]' : 'text-[#222]',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
