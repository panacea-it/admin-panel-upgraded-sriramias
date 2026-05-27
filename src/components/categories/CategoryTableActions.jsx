import { Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '../../utils/cn'

function ActionBtn({ label, onClick, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium transition-all duration-150 hover:scale-105 active:scale-95',
        className,
      )}
    >
      {children}
      <span className={cn(compact ? 'sr-only' : 'hidden sm:inline')}>{label}</span>
    </button>
  )
}

export default function CategoryTableActions({
  status,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  compact = false,
}) {
  const isActive = status === 'Active'

  return (
    <div
      className={cn(
        'flex items-center',
        compact ? 'flex-nowrap justify-end gap-0.5' : 'flex-wrap gap-2 sm:gap-3',
      )}
    >
      <ActionBtn
        label="View"
        onClick={onView}
        className="text-[#686868] hover:bg-slate-100 hover:text-[#246392]"
      >
        <Eye className="h-4 w-4" strokeWidth={2.2} />
      </ActionBtn>
      <ActionBtn
        label="Edit"
        onClick={onEdit}
        className="text-[#686868] hover:bg-slate-100 hover:text-[#246392]"
      >
        <Pencil className="h-4 w-4" strokeWidth={2.2} />
      </ActionBtn>
      <ActionBtn
        label={isActive ? 'Disable' : 'Enable'}
        onClick={onToggleStatus}
        className="text-[#246392] hover:bg-[#eef2fc]"
      >
        {isActive ? (
          <ToggleRight className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <ToggleLeft className="h-4 w-4" strokeWidth={2.2} />
        )}
      </ActionBtn>
      <ActionBtn
        label="Delete"
        onClick={onDelete}
        className="text-[#c96565] hover:bg-red-50 hover:text-[#b94b4b]"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2.1} />
      </ActionBtn>
    </div>
  )
}
