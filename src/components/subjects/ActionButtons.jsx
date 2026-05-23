import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'

function TextAction({ label, onClick, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80',
        className,
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

export function SubjectRowActions({ onAdd, onViewList, onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-8 items-center gap-1 rounded-lg bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-3 text-xs font-semibold text-white shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        Add
      </button>
      <TextAction
        label="View List"
        onClick={onViewList}
        className="text-[#246392]"
      >
        <Eye className="h-4 w-4" strokeWidth={2.2} />
      </TextAction>
      <TextAction
        label="Edit"
        onClick={onEdit}
        className="text-[#686868]"
      >
        <Pencil className="h-4 w-4" strokeWidth={2.2} />
      </TextAction>
      <TextAction
        label="Delete"
        onClick={onDelete}
        className="text-[#c96565]"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2.1} />
      </TextAction>
    </div>
  )
}

export function TopicRowActions({ onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <TextAction
        label="Edit"
        onClick={onEdit}
        className="text-[#686868]"
      >
        <Pencil className="h-4 w-4" strokeWidth={2.2} />
      </TextAction>
      <TextAction
        label="Delete"
        onClick={onDelete}
        className="text-[#c96565]"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2.1} />
      </TextAction>
    </div>
  )
}
