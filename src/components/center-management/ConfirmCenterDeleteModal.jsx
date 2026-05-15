import Modal from '../ui/Modal'

export default function ConfirmCenterDeleteModal({ open, centerName, loading, onCancel, onConfirm }) {
  return (
    <Modal open={open} onClose={onCancel} title="Delete center" size="md">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950">
        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete center?</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
            This permanently removes{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{centerName}</span> from
            the directory. You can only delete centers that have no assigned admins and no linked
            students.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-2.5 text-[14px] font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Deleting…' : 'Delete center'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
