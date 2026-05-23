import { Navigate } from 'react-router-dom'
import {
  Wallet,
  FileSearch,
  Tv,
  SlidersHorizontal,
  ScrollText,
  Database,
  Plug,
  ListOrdered,
} from 'lucide-react'
import RoleRoute from './RoleRoute'
import { ROLES } from '../constants/roles'
import {
  AdminManagementPage,
  AdminAccessTypesPage,
  RoleAccessMatrixPage,
  CenterManagementPage,
  ManageUsersPage,
  StudentDetailPage,
  AnalyticsPage,
  BooksPage,
  WebsitePage,
  BannersPage,
  BlogsPage,
  ContentLibraryPage,
  CouponsPage,
  BatchesPage,
  SubjectsPage,
  SubjectViewListPage,
  LiveClassesLayout,
  FinanceLayout,
  SalesAnalyticsLayout,
  BookstoreLayout,
  TestsPage,
  CurrentAffairsPage,
  CategoriesLayout,
  SubjectCategoryPage,
  EnquiriesPage,
  LeadsPage,
  HelpDeskPage,
  PushNotificationsPage,
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
  { path: 'academics/batch', element: <BatchesPage /> },
  { path: 'academics/subjects', element: <SubjectsPage /> },
  { path: 'academics/subjects/:id', element: <SubjectViewListPage /> },
  { path: 'courses', element: <Navigate to="/academics/batch" replace /> },
  { path: 'live-classes', element: <Navigate to="/academics/live-classes/schedule" replace /> },
  { path: 'academics/live-classes/*', element: <LiveClassesLayout /> },
  { path: 'content-library', element: <ContentLibraryPage /> },
  { path: 'tests', element: <TestsPage /> },
  { path: 'current-affairs', element: <CurrentAffairsPage /> },
  { path: 'academics/categories', element: <Navigate to="/academics/categories/programs" replace /> },
  { path: 'academics/categories/*', element: <CategoriesLayout /> },
  { path: 'academics/categories/main', element: <Navigate to="/academics/categories/exam-category" replace /> },
  { path: 'academics/categories/subject-setup', element: <SubjectCategoryPage /> },
  { path: 'categories', element: <Navigate to="/academics/categories/programs" replace /> },
  { path: 'users/manage', element: <ManageUsersPage /> },
  { path: 'users/manage/students/:userId', element: <StudentDetailPage /> },
  { path: 'users/wallet', element: module(Wallet, 'Wallet', 'Add Transaction', 'Search wallet') },
  { path: 'coupons', element: <CouponsPage /> },
  {
    path: 'users/admin',
    element: (
      <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <AdminManagementPage />
      </RoleRoute>
    ),
  },
  {
    path: 'users/admin-access-types',
    element: (
      <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <AdminAccessTypesPage />
      </RoleRoute>
    ),
  },
  {
    path: 'users/role-matrix',
    element: (
      <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <RoleAccessMatrixPage />
      </RoleRoute>
    ),
  },
  {
    path: 'users/centers',
    element: (
      <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTER_ADMIN]}>
        <CenterManagementPage />
      </RoleRoute>
    ),
  },
  { path: 'crm/leads', element: <LeadsPage /> },
  { path: 'enquiries', element: <EnquiriesPage /> },
  { path: 'crm/help-desk', element: <HelpDeskPage /> },
  { path: 'crm/push-notifications', element: <PushNotificationsPage /> },
  { path: 'marketing/banners', element: <BannersPage /> },
  { path: 'marketing/website', element: <WebsitePage /> },
  {
    path: 'marketing/seo-landing',
    element: module(FileSearch, 'SEO Landing Pages', 'Add Landing Page', 'Search pages'),
  },
  { path: 'marketing/blogs', element: <BlogsPage /> },
  { path: 'marketing/blogs/new', element: <Navigate to="/marketing/blogs" replace /> },
  { path: 'marketing/blogs/:id/edit', element: <Navigate to="/marketing/blogs" replace /> },
  { path: 'blogs', element: <Navigate to="/marketing/blogs" replace /> },
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
  { path: 'free-resources', element: <ContentLibraryPage /> },
  { path: 'books', element: <Navigate to="/marketing/books" replace /> },
  { path: 'finance', element: <Navigate to="/finance/dashboard" replace /> },
  { path: 'finance/*', element: <FinanceLayout /> },
  { path: 'sales-analytics', element: <Navigate to="/sales-analytics/dashboard" replace /> },
  { path: 'sales-analytics/*', element: <SalesAnalyticsLayout /> },
  { path: 'admin/bookstore', element: <Navigate to="/admin/bookstore/dashboard" replace /> },
  { path: 'admin/bookstore/*', element: <BookstoreLayout /> },
]
