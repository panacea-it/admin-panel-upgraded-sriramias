import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

const VARIANTS = {
  danger: {
    icon: AlertTriangle,
    iconWrap: 'bg-red-50',
    iconColor: 'text-red-500',
    confirm:
      'bg-gradient-to-r from-[#c96565] to-[#b94b4b] text-white hover:opacity-90',
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-50',
    iconColor: 'text-amber-600',
    confirm:
      'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90',
  },
  primary: {
    icon: Info,
    iconWrap: 'bg-[#eef6fc]',
    iconColor: 'text-[#246392]',
    confirm:
      'bg-gradient-to-r from-[#55ace7] to-[#246392] text-white hover:opacity-90',
  },
}

export default function ConfirmActionDialog({
  open,
  title = 'Confirm action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'primary',
}) {
  const style = VARIANTS[variant] ?? VARIANTS.primary
  const Icon = style.icon

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Cancel"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-labelledby="confirm-action-title"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                  style.iconWrap,
                )}
              >
                <Icon className={cn('h-5 w-5', style.iconColor)} />
              </div>
              <div>
                <h3 id="confirm-action-title" className="text-lg font-bold text-[#222]">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-[#686868]">{message}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-[#444] transition hover:bg-slate-50 disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  'h-10 rounded-xl px-5 text-sm font-semibold shadow-sm transition disabled:opacity-60',
                  style.confirm,
                )}
              >
                {loading ? 'Please wait…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
