import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import BookstorePageShell from '../../components/bookstore/BookstorePageShell'
import BookstoreModal, { BookstoreModalFooter } from '../../components/bookstore/modal/BookstoreModal'
import Button from '../../components/ui/Button'
import {
  BOOKSTORE_ROLES,
  BOOKSTORE_ROLE_LABELS,
  BOOKSTORE_PERMISSION_MATRIX,
} from '../../config/bookstoreRbac'
import { BOOKSTORE_NAV_ITEMS } from '../../constants/bookstoreNav'
import { toast } from '../../utils/toast'
import { BOOKSTORE_INPUT_CLASS, BOOKSTORE_LABEL_CLASS } from '../../components/bookstore/modal/bookstoreFormStyles'

export default function BookstoreRbacPage() {
  const permissions = BOOKSTORE_NAV_ITEMS.map((n) => n.permission)
  const [roleOpen, setRoleOpen] = useState(false)
  const [permOpen, setPermOpen] = useState(false)
  const [roleName, setRoleName] = useState('')

  return (
    <BookstorePageShell
      icon={ShieldCheck}
      title="Roles & Permissions"
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={() => setRoleOpen(true)} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">Create role</button>
          <button type="button" onClick={() => setPermOpen(true)} className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold text-white">Manage permissions</button>
        </div>
      }
    >
      <p className="rounded-xl bg-white p-4 text-sm text-[#686868] shadow-sm">
        Bookstore module roles are scoped separately from academics. Platform super admins receive full access;
        other IAM roles map to bookstore permissions via <code className="text-xs">bookstoreRbac.js</code>.
      </p>
      <div className="overflow-x-auto rounded-xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eee] bg-[#f9f9fb]">
              <th className="px-4 py-3 font-semibold">Permission</th>
              {Object.values(BOOKSTORE_ROLES).map((role) => (
                <th key={role} className="px-4 py-3 font-semibold">
                  {BOOKSTORE_ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm} className="border-b border-[#f0f0f0]">
                <td className="px-4 py-2.5 capitalize">{perm.replace(/_/g, ' ')}</td>
                {Object.values(BOOKSTORE_ROLES).map((role) => (
                  <td key={role} className="px-4 py-2.5 text-center">
                    {BOOKSTORE_PERMISSION_MATRIX[role]?.includes(perm) ? '✓' : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BookstoreModal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="Create bookstore role"
        subtitle="Define a new role for the bookstore module"
        size="md"
        footer={
          <BookstoreModalFooter>
            <Button variant="ghost" onClick={() => setRoleOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success(`Role "${roleName}" saved (placeholder)`); setRoleOpen(false) }}>Create role</Button>
          </BookstoreModalFooter>
        }
      >
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Role name</span>
          <input className={BOOKSTORE_INPUT_CLASS} value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g. Catalog Manager" />
        </label>
      </BookstoreModal>

      <BookstoreModal
        open={permOpen}
        onClose={() => setPermOpen(false)}
        title="Permission management"
        subtitle="Toggle access for bookstore roles"
        size="lg"
        footer={
          <BookstoreModalFooter>
            <Button onClick={() => { toast.success('Permissions updated (placeholder)'); setPermOpen(false) }}>Save permissions</Button>
          </BookstoreModalFooter>
        }
      >
        <p className="mb-3 text-sm text-[#686868]">Use the matrix above as reference. Full permission editor will sync with backend RBAC.</p>
        <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-[#eef0f4] p-3">
          {permissions.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" id={`perm-${p}`} />
              <label htmlFor={`perm-${p}`} className="capitalize">{p.replace(/_/g, ' ')}</label>
            </li>
          ))}
        </ul>
      </BookstoreModal>
    </BookstorePageShell>
  )
}
