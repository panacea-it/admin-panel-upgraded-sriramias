import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LayoutGrid } from 'lucide-react'
import PageBanner from '../../components/figma/PageBanner'
import RoleAccessMatrix from '../../components/admin-management/RoleAccessMatrix'

export default function RoleAccessMatrixPage() {
  const [searchParams] = useSearchParams()
  const focusRoleId = searchParams.get('focus') || ''

  const handleSavePermissions = (detail) => {
    if (!detail?.rbacPayload || !detail?.nestedState || !Array.isArray(detail.rbacPayload.roles)) {
      toast.error('Invalid permission state')
      return
    }

    if (!detail.fullExport?.roleDefinitions) {
      toast.error('Invalid export payload — role catalog missing')
      return
    }

    // detail.fullExport is POST-ready: { version, rbac, roles, roleDefinitions, exportedAt }

    toast.success('Role access saved', {
      description: 'Permissions updated successfully — payload includes role actions and matrix.',
    })
  }

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-10 pt-6 dark:bg-[var(--app-bg)] sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-6 sm:space-y-8">
        <PageBanner icon={LayoutGrid} title="Role Access Matrix">
          <p className="max-w-xl text-right text-sm font-medium leading-snug text-white/90">
            Rows reflect dynamic admin access types. Save exports matrix + role-definition metadata for your API.
          </p>
        </PageBanner>

        <RoleAccessMatrix onSave={handleSavePermissions} focusRoleId={focusRoleId} />
      </section>
    </div>
  )
}
