import { Mail, Phone, User } from 'lucide-react'
import Modal from '../ui/Modal'
import { roleLabel } from '../../data/manageUsersConfig'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { StatusBadge } from '../academics/AcademicsUi'

function DetailRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#686868]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111]">{children}</p>
    </div>
  )
}

export default function ViewUserModal({ open, onClose, user }) {
  if (!open || !user) return null

  return (
    <Modal open={open} onClose={onClose} size="md" title="View User">
      <div className="space-y-6 px-5 py-5 sm:px-8">
        <div className="flex items-start gap-4">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              className="h-16 w-16 shrink-0 rounded-xl border border-[#eef2fc] object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#eef6fc] text-[#246392]">
              <User className="h-8 w-8" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#111]">{user.fullName}</h3>
            <p className="font-mono text-sm text-[#246392]">{user.userId}</p>
            <div className="mt-2">
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Email">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#686868]" />
              {user.email}
            </span>
          </DetailRow>
          <DetailRow label="Phone">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#686868]" />
              {user.phone}
            </span>
          </DetailRow>
          <DetailRow label="Parent Name">{user.parentName || '—'}</DetailRow>
          <DetailRow label="Parent Phone Number">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#686868]" />
              {user.parentPhone || '—'}
            </span>
          </DetailRow>
          <DetailRow label="Role">{roleLabel(user.role)}</DetailRow>
          <DetailRow label="Assigned Center">{user.assignedCenter || '—'}</DetailRow>
          <DetailRow label="Joined Date">{formatCategoryDateTime(user.joinedAt)}</DetailRow>
          <DetailRow label="Last Updated">{formatCategoryDateTime(user.updatedAt)}</DetailRow>
        </dl>

        <div className="flex justify-end border-t border-[#eef2fc] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[100px] rounded-full bg-gradient-to-r from-[#0d3b66] to-[#05192d] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
