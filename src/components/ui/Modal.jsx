import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function Modal({
  open,
  onClose,
  children,
  className,
  size = 'lg',
  title = 'Dialog',
}) {
  const titleId = useId()
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    full: 'max-w-[min(100%,1100px)]',
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative my-2 w-full outline-none',
          sizes[size] ?? sizes.lg,
          className,
        )}
      >
        <span id={titleId} className="sr-only">
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition hover:bg-white sm:hidden"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
