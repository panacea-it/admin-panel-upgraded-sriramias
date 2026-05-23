import { cn } from '../../utils/cn'

export default function FormModalSubmitBar({
  isEditMode,
  onReset,
  createLabel = 'Create',
  updateLabel = 'Update',
  resetLabel = 'Reset',
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-4 border-t border-slate-200/80 pt-8',
        className,
      )}
    >
      <button
        type="button"
        onClick={onReset}
        className="min-w-[148px] rounded-full bg-gradient-to-r from-[#5eb8f5] to-[#2b78a5] px-10 py-3.5 text-base font-bold text-white shadow-[0_6px_18px_rgba(43,120,165,0.35)] transition hover:scale-[1.02] hover:brightness-105 active:scale-[0.98]"
      >
        {resetLabel}
      </button>
      <button
        type="submit"
        className="min-w-[148px] rounded-full bg-gradient-to-r from-[#0d3b66] to-[#05192d] px-10 py-3.5 text-base font-bold text-white shadow-[0_6px_18px_rgba(5,25,45,0.4)] transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
      >
        {isEditMode ? updateLabel : createLabel}
      </button>
    </div>
  )
}
