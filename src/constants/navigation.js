import {
  LayoutDashboard,
  Bookmark,
  Layers,
  Globe2,
  LibraryBig,
  TicketPercent,
  Settings,
  BookOpen,
  BookMarked,
  Radio,
  FolderOpen,
  Gift,
  ClipboardList,
  Newspaper,
  Users,
  Wallet,
  Shield,
  UserPlus,
  MessageCircle,
  Headphones,
  BellRing,
  Image,
  Globe,
  FileSearch,
  FileText,
  Tv,
  BarChart2,
  SlidersHorizontal,
  ScrollText,
  Database,
  Plug,
  ListOrdered,
  Building2,
  IdCard,
  LayoutGrid,
} from 'lucide-react'

/** Top-level dashboard link (no children) */
export const SIDEBAR_DASHBOARD = {
  id: 'dashboard',
  label: 'Dashboard',
  path: '/dashboard',
  icon: LayoutDashboard,
}

/** Collapsible sidebar groups — matches Figma accordion nav */
export const SIDEBAR_GROUPS = [
  {
    id: 'academics',
    label: 'Academics',
    icon: Bookmark,
    children: [
      { label: 'Courses', path: '/courses', icon: BookOpen },
      { label: 'Live Classes', path: '/live-classes', icon: Radio },
      { label: 'Content Library', path: '/content-library', icon: FolderOpen },
      { label: 'Books', path: '/marketing/books', icon: BookMarked },
      { label: 'Free Resources', path: '/free-resources', icon: Gift },
      { label: 'Tests', path: '/tests', icon: ClipboardList },
      { label: 'Current Affairs', path: '/current-affairs', icon: Newspaper },
    ],
  },
  {
    id: 'admin-management',
    label: 'Admin Management',
    icon: Shield,
    children: [
      { label: 'Admin Access Types', path: '/users/admin-access-types', icon: IdCard },
      { label: 'Role Access Matrix', path: '/users/role-matrix', icon: LayoutGrid },
      {
        label: 'Centre Management',
        path: '/users/centers',
        icon: Building2,
        requiredRoles: ['superadmin'],
      },
    ],
  },
  {
    id: 'users',
    label: 'Users & Access',
    icon: Layers,
    children: [
      { label: 'Manage Users', path: '/users/manage', icon: Users },
      { label: 'Wallet', path: '/users/wallet', icon: Wallet },
      { label: 'Coupons', path: '/coupons', icon: TicketPercent },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Globe2,
    children: [
      { label: 'Leads', path: '/crm/leads', icon: UserPlus },
      { label: 'Enquiries', path: '/enquiries', icon: MessageCircle },
      { label: 'Help Desk', path: '/crm/help-desk', icon: Headphones },
      { label: 'Push Notifications', path: '/crm/push-notifications', icon: BellRing },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: LibraryBig,
    children: [
      { label: 'Banners', path: '/marketing/banners', icon: Image },
      { label: 'Website', path: '/marketing/website', icon: Globe },
      { label: 'SEO Landing page', path: '/marketing/seo-landing', icon: FileSearch },
      { label: 'Blogs', path: '/marketing/blogs', icon: FileText },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: TicketPercent,
    children: [
      { label: 'Live Module', path: '/operations/live-module', icon: Tv },
      { label: 'Reports & Analytics', path: '/analytics', icon: BarChart2 },
      { label: 'Configuration', path: '/operations/configuration', icon: SlidersHorizontal },
      { label: 'Audit Logs', path: '/operations/audit-logs', icon: ScrollText },
    ],
  },
  {
    id: 'system',
    label: 'System Tools',
    icon: Settings,
    children: [
      { label: 'Data Imp / Export', path: '/system/data-import-export', icon: Database },
      { label: 'API Integrations', path: '/system/api-integrations', icon: Plug },
      { label: 'Queue Monitor', path: '/system/queue-monitor', icon: ListOrdered },
    ],
  },
]

/** All child paths for active-group detection */
export function getGroupIdForPath(pathname) {
  for (const group of SIDEBAR_GROUPS) {
    if (group.children.some((c) => pathname === c.path || pathname.startsWith(`${c.path}/`))) {
      return group.id
    }
  }
  return null
}

export const SETTINGS_NAV = [
  { label: 'Profile', path: '/settings/profile', icon: Users },
  { label: 'Notifications', path: '/settings/notifications', icon: BellRing },
  { label: 'General', path: '/settings/general', icon: Settings },
]
