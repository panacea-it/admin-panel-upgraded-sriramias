import { useState } from 'react'
import { Edit3, Globe, ImageIcon, Trash2 } from 'lucide-react'
import { UploadFieldHint, UploadValidationMessage } from '../common/UploadFieldHint'
import { cn } from '../../utils/cn'
import { validateUploadFile } from '../../utils/uploadValidation'

export const websiteInputClass =
  'h-11 w-full rounded-lg border-0 bg-[#eef6fc] px-4 text-sm text-[#111] outline-none transition focus:ring-2 focus:ring-[#55ace7]/40'

/** Single-line date per Figma: "10 AM , 14 May 2026" */
export function DateTimeInline({ time, date }) {
  return (
    <span className="whitespace-nowrap text-sm text-[#111]">
      {time}
      <span className="text-[#9ca0a8]"> , </span>
      {date}
    </span>
  )
}

export function DateTimeCell({ time, date }) {
  return <DateTimeInline time={time} date={date} />
}

export function YoutubeUrlLink({ url }) {
  return (
    <a
      href={`https://${url.replace(/^https?:\/\//, '')}`}
      target="_blank"
      rel="noreferrer"
      className="block max-w-[220px] truncate text-sm text-[#55ace7] underline decoration-[#55ace7]/50 underline-offset-2 transition hover:text-[#246392] hover:decoration-[#246392]"
      title={url}
    >
      {url}
    </a>
  )
}

export function TableRowActions({ onEdit, onDelete, compact = false }) {
  return (
    <div
      className={cn(
        'flex items-center',
        compact ? 'gap-4' : 'flex-wrap gap-3 sm:gap-4',
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#686868] transition-colors hover:text-[#246392]"
      >
        <Edit3
          className="h-4 w-4 transition-transform group-hover:scale-110"
          strokeWidth={2.35}
        />
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#c96565] transition-colors hover:text-[#b94b4b]"
      >
        <Trash2
          className="h-4 w-4 transition-transform group-hover:scale-110"
          strokeWidth={2.1}
        />
        Delete
      </button>
    </div>
  )
}

export function WebsiteField({ label, required, children, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <label className="mb-2 block text-sm font-medium text-[#333]">
        {label}
        {required && <span className="text-[#dc2626]"> *</span>}
      </label>
      {children}
    </div>
  )
}

export function WebsiteUrlInput({ value, onChange, id }) {
  return (
    <div className="relative">
      <input
        id={id}
        type="url"
        value={value}
        onChange={onChange}
        className={cn(websiteInputClass, 'pr-11')}
        placeholder="https://youtube.com/..."
      />
      <span className="pointer-events-none absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#69df66]">
        <Globe className="h-4 w-4 text-white" strokeWidth={2.2} />
      </span>
    </div>
  )
}

export function WebsiteImageInput({ value, onChange, id }) {
  const [uploadError, setUploadError] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await validateUploadFile(file, 'IMAGE_STANDARD')
    if (!result.valid) {
      setUploadError(result.message)
      e.target.value = ''
      return
    }
    setUploadError(null)
    onChange(file.name)
  }

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          value={value || '312×214 Kb'}
          className={cn(websiteInputClass, 'cursor-pointer pr-11')}
          onClick={() => document.getElementById(`${id}-file`)?.click()}
        />
        <input
          id={`${id}-file`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
        <ImageIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55ace7]" />
      </div>
      <UploadFieldHint profile="IMAGE_STANDARD" />
      <UploadValidationMessage message={uploadError} />
    </div>
  )
}

export function RankerImageCell({ name }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-[#e8f4fc] to-[#dbeafe]">
      <span className="text-xs font-bold text-[#246392]">
        {name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </span>
    </div>
  )
}
