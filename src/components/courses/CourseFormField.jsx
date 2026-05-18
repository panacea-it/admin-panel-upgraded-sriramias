import { Calendar, ChevronDown, FileText, Image as ImageIcon, Video } from 'lucide-react'
import { cn } from '../../utils/cn'

const fieldShell =
  'h-11 w-full rounded-lg bg-[#e8f4fc] px-3 text-sm text-[#333] outline-none placeholder:text-[#8b98bb] focus:ring-2 focus:ring-[#55ace7]/40 sm:text-[15px]'

export function CourseFormField({ label, required, children, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <label className="mb-1.5 block text-xs font-semibold text-[#5c5c5c] sm:text-sm">
        {label}
        {required && <span className="text-[#c96565]"> *</span>}
      </label>
      {children}
    </div>
  )
}

export function CourseInput(props) {
  return <input className={fieldShell} {...props} />
}

export function CourseSelect({ children, className, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select className={cn(fieldShell, 'appearance-none pr-9')} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#246392]" />
    </div>
  )
}

export function CourseDateInput({ className, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <input type="date" className={cn(fieldShell, 'pr-10')} {...props} />
      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#246392]" />
    </div>
  )
}

export function CourseFileInput({ accept = 'image/*', placeholder = '360 to 480 kb', onChange, className }) {
  return (
    <label
      className={cn(
        'relative flex h-11 w-full cursor-pointer items-center rounded-lg bg-[#e8f4fc] px-3 text-sm text-[#8b98bb]',
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate">{placeholder}</span>
      <ImageIcon className="ml-2 h-5 w-5 shrink-0 text-[#246392]" />
      <input type="file" accept={accept} className="sr-only" onChange={onChange} />
    </label>
  )
}

export function CourseTextarea({ className, rows = 6, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full resize-y rounded-lg bg-[#e8f4fc] px-4 py-3 text-sm text-[#333] outline-none placeholder:text-[#8b98bb] focus:ring-2 focus:ring-[#55ace7]/40 sm:text-[15px]',
        className,
      )}
      {...props}
    />
  )
}

export function CourseMediaSlot({
  placeholder,
  icon = 'image',
  fileName,
  className,
  onFileChange,
  accept,
}) {
  const Icon = icon === 'video' ? Video : ImageIcon

  if (onFileChange) {
    return (
      <label
        className={cn(
          'relative flex h-11 w-full cursor-pointer items-center rounded-lg bg-[#e8f4fc] px-3 text-xs text-[#8b98bb] sm:text-sm',
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{fileName || placeholder}</span>
        <Icon className="ml-2 h-5 w-5 shrink-0 text-[#246392]" />
        <input type="file" accept={accept} className="sr-only" onChange={onFileChange} />
      </label>
    )
  }

  return (
    <div
      className={cn(
        'flex h-11 w-full items-center rounded-lg bg-[#e8f4fc] px-3 text-xs text-[#8b98bb] sm:text-sm',
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate">{fileName || placeholder}</span>
      <Icon className="ml-2 h-5 w-5 shrink-0 text-[#246392]" />
    </div>
  )
}

export function CourseIconSlot({ onClick, className }) {
  return (
    <div
      className={cn(
        'flex h-11 w-full items-center rounded-lg bg-[#e8f4fc] px-2',
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="rounded-md bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#246392] shadow-sm transition hover:bg-slate-50"
      >
        ADD ICON
      </button>
    </div>
  )
}

export function CourseAddMoreLink({ onClick, className, children = 'ADD MORE' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-sm font-bold uppercase tracking-wide text-[#246392] underline underline-offset-4 transition hover:text-[#1a4d6d]',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function CoursePdfInput({
  fileName,
  onChange,
  placeholder = 'Upload sample PDF',
  className,
}) {
  return (
    <label
      className={cn(
        'relative flex h-11 w-full cursor-pointer items-center rounded-lg bg-[#e8f4fc] px-3 text-sm text-[#8b98bb]',
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate">{fileName || placeholder}</span>
      <FileText className="ml-2 h-5 w-5 shrink-0 text-[#246392]" />
      <input
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={onChange}
      />
    </label>
  )
}

export function CourseFeeInput({ variant = 'online', ...props }) {
  return (
    <div className="relative">
      <input className={cn(fieldShell, 'pr-14')} {...props} />
      <span
        className="pointer-events-none absolute right-2 top-1/2 flex h-8 w-10 -translate-y-1/2 items-center justify-center text-lg"
        aria-hidden
      >
        {variant === 'online' ? '💻' : '👨‍🏫'}
      </span>
    </div>
  )
}
