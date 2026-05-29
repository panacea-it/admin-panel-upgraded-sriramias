import Modal from '../../ui/Modal'
import { StatusBadge } from '../../academics/AcademicsUi'
import { formatCategoryDateTime } from '../../../utils/formatDateTime'

function displayRoleCode(id) {
  return String(id || '')
    .trim()
    .replace(/-/g, '_')
    .toUpperCase()
}

function roleStatus(role) {
  return role?.enabled ? 'Active' : 'In Active'
}

function DetailRow({ label, children }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-1.5 text-[15px] font-semibold text-slate-900">{children}</div>
    </div>
  )
}

export default function AdminRoleViewModal({ open, role, onClose }) {
  if (!role) return null

  return (
    <Modal open={open} onClose={onClose} size="md" title="View Role Access">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl">
        <header className="border-b border-slate-100 px-6 py-5 pr-14">
          <h2 className="text-xl font-bold text-slate-900">Role access details</h2>
          <p className="mt-1 text-sm text-slate-500">Read-only view</p>
        </header>
        <div className="space-y-4 px-6 py-6">
          <DetailRow label="Role Title (Display)">{role.label}</DetailRow>
          <DetailRow label="Role Code">
            <span className="font-mono text-sm tracking-wide text-[#246392]">
              {displayRoleCode(role.id)}
            </span>
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={roleStatus(role)} />
          </DetailRow>
          {role.description ? (
            <DetailRow label="Description">
              <p className="text-[14px] font-medium leading-relaxed text-slate-700">
                {role.description}
              </p>
            </DetailRow>
          ) : null}
          {role.modules?.length > 0 ? (
            <DetailRow label="Modules">
              <div className="flex flex-wrap gap-2">
                {role.modules.map((mod) => (
                  <span
                    key={mod}
                    className="inline-flex rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </DetailRow>
          ) : null}
          <DetailRow label="Created On">
            <span className="text-[14px] font-medium text-slate-700">
              {formatCategoryDateTime(role.createdAt)}
            </span>
          </DetailRow>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
