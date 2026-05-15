import { Navigate } from 'react-router-dom'
import {
  Radio,
  ClipboardList,
  Tags,
  Users,
  Wallet,
  UserPlus,
  Headphones,
  BellRing,
  Image,
  Globe,
  FileSearch,
  FileText,
  Tv,
  SlidersHorizontal,
  ScrollText,
  Database,
  Plug,
  ListOrdered,
} from 'lucide-react'
import RoleRoute from './RoleRoute'
import {
  AdminManagementPage,
  AdminAccessTypesPage,
  RoleAccessMatrixPage,
  CenterManagementPage,
  AnalyticsPage,
  BooksPage,
  ContentLibraryPage,
  CouponsPage,
  CoursesPage,
  CurrentAffairsPage,
  EnquiriesPage,
  ModuleListPage,
} from './lazyPages'

function module(icon, title, addLabel, searchPlaceholder) {
  return (
    <ModuleListPage
      icon={icon}
      title={title}
      addLabel={addLabel}
      searchPlaceholder={searchPlaceholder}
    />
  )
}

export const MODULE_ROUTE_ELEMENTS = [
  { path: 'courses', element: <CoursesPage /> },
  { path: 'live-classes', element: module(Radio, 'Live Classes', 'Schedule Class', 'Search classes') },
  { path: 'content-library', element: <ContentLibraryPage /> },
  { path: 'tests', element: module(ClipboardList, 'Tests', 'Create Test', 'Search tests') },
  { path: 'current-affairs', element: <CurrentAffairsPage /> },
  { path: 'categories', element: module(Tags, 'Categories', 'Add Category', 'Search categories') },
  { path: 'users/manage', element: module(Users, 'Manage Users', 'Add User', 'Search users') },
  { path: 'users/wallet', element: module(Wallet, 'Wallet', 'Add Transaction', 'Search wallet') },
  { path: 'coupons', element: <CouponsPage /> },
  {
    path: 'users/admin',
    element: (
      <RoleRoute allowedRoles={['superadmin']}>
        <AdminManagementPage />
      </RoleRoute>
    ),
  },
  {
    path: 'users/admin-access-types',
    element: (
      <RoleRoute allowedRoles={['superadmin']}>
        <AdminAccessTypesPage />
      </RoleRoute>
    ),
  },
  {
    path: 'users/role-matrix',
    element: (
      <RoleRoute allowedRoles={['superadmin']}>
        <RoleAccessMatrixPage />
      </RoleRoute>
    ),
  },
  {
    path: 'users/centers',
    element: (
      <RoleRoute allowedRoles={['superadmin']}>
        <CenterManagementPage />
      </RoleRoute>
    ),
  },
  { path: 'crm/leads', element: module(UserPlus, 'Leads', 'Add Lead', 'Search leads') },
  { path: 'enquiries', element: <EnquiriesPage /> },
  {
    path: 'crm/help-desk',
    element: module(Headphones, 'Help Desk', 'New Ticket', 'Search tickets'),
  },
  {
    path: 'crm/push-notifications',
    element: module(BellRing, 'Push Notifications', 'Send Notification', 'Search notifications'),
  },
  { path: 'marketing/banners', element: module(Image, 'Banners', 'Add Banner', 'Search banners') },
  { path: 'marketing/website', element: module(Globe, 'Website', 'Add Page', 'Search pages') },
  {
    path: 'marketing/seo-landing',
    element: module(FileSearch, 'SEO Landing Pages', 'Add Landing Page', 'Search pages'),
  },
  { path: 'blogs', element: module(FileText, 'Blogs', 'New Blog', 'Search blogs') },
  { path: 'marketing/books', element: <BooksPage /> },
  { path: 'operations/live-module', element: module(Tv, 'Live Module', 'Add Module', 'Search modules') },
  { path: 'analytics', element: <AnalyticsPage /> },
  {
    path: 'operations/configuration',
    element: module(SlidersHorizontal, 'Configuration', 'Add Setting', 'Search settings'),
  },
  {
    path: 'operations/audit-logs',
    element: module(ScrollText, 'Audit Logs', 'Export Logs', 'Search logs'),
  },
  {
    path: 'system/data-import-export',
    element: module(Database, 'Data Import / Export', 'Import Data', 'Search records'),
  },
  {
    path: 'system/api-integrations',
    element: module(Plug, 'API Integrations', 'Add Integration', 'Search integrations'),
  },
  {
    path: 'system/queue-monitor',
    element: module(ListOrdered, 'Queue Monitor', 'Refresh', 'Search queue'),
  },
  { path: 'free-resources', element: <Navigate to="/content-library" replace /> },
  { path: 'books', element: <Navigate to="/marketing/books" replace /> },
]
