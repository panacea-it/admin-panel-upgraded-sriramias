import { lazy } from 'react'

export const BatchesPage = lazy(() => import('../pages/academics/BatchesPage'))
export const BatchDetailsPage = lazy(() => import('../pages/academics/BatchDetailsPage'))
export const BatchManagementLayout = lazy(() => import('../layouts/BatchManagementLayout'))
export const SubjectsPage = lazy(() => import('../pages/academics/SubjectsPage'))
export const SubjectViewListPage = lazy(
  () => import('../pages/academics/SubjectViewListPage'),
)
export const CoursesPage = BatchesPage
export const LiveClassesPage = lazy(() => import('../pages/academics/LiveClassesPage'))
export const LiveClassesLayout = lazy(() => import('../layouts/LiveClassesLayout'))
export const ScheduleClassPage = lazy(() => import('../pages/academics/live-classes/ScheduleClassPage'))
export const RecordedClassesPage = lazy(
  () => import('../pages/academics/live-classes/RecordedClassesPage'),
)
export const LiveSessionsPage = lazy(() => import('../pages/academics/live-classes/LiveSessionsPage'))
export const CalendarViewPage = lazy(() => import('../pages/academics/live-classes/CalendarViewPage'))
export const LiveClassDetailPage = lazy(
  () => import('../pages/academics/live-classes/LiveClassDetailPage'),
)
export const ContentLibraryPage = lazy(() => import('../pages/academics/ContentLibraryPage'))
export const ContentLibraryLayout = lazy(() => import('../layouts/ContentLibraryLayout'))
export const FreeResourcesPage = lazy(() => import('../pages/academics/FreeResourcesPage'))
export const TestsPage = lazy(() => import('../pages/academics/TestsPage'))
export const CurrentAffairsPage = lazy(() => import('../pages/academics/CurrentAffairsPage'))
export const CategoriesLayout = lazy(() => import('../layouts/CategoriesLayout'))
export const CategoriesHubPage = lazy(
  () => import('../pages/academics/categories/CategoriesHubPage'),
)
export const MainCategoryPage = lazy(() => import('../pages/academics/categories/MainCategoryPage'))
export const SubjectCategoryPage = lazy(() =>
  import('../pages/academics/categories/SubjectCategoryPage'),
)
export const BooksPage = lazy(() => import('../pages/marketing/BooksPage'))
export const WebsitePage = lazy(() => import('../pages/marketing/WebsitePage'))
export const BannersPage = lazy(() => import('../pages/marketing/BannersPage'))
export const BlogsPage = lazy(() => import('../pages/marketing/BlogsPage'))
export const CouponsPage = lazy(() => import('../pages/users/CouponsPage'))
export const EnquiriesPage = lazy(() => import('../pages/crm/EnquiriesPage'))
export const LeadsPage = lazy(() => import('../pages/crm/LeadsPage'))
export const HelpDeskPage = lazy(() => import('../pages/crm/HelpDeskPage'))
export const PushNotificationsPage = lazy(() => import('../pages/crm/PushNotificationsPage'))
export const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'))
export const AdminManagementPage = lazy(() => import('../pages/users/AdminManagementPage'))
export const AdminAccessTypesPage = lazy(() => import('../pages/users/AdminAccessTypesPage'))
export const RoleAccessMatrixPage = lazy(() => import('../pages/users/RoleAccessMatrixPage'))
export const CenterManagementPage = lazy(() => import('../pages/users/CenterManagementPage'))
export const ManageUsersPage = lazy(() => import('../pages/users/ManageUsersPage'))
export const StudentDetailPage = lazy(() => import('../pages/users/StudentDetailPage'))
export const ModuleListPage = lazy(() => import('../pages/ModuleListPage'))
export const FinanceLayout = lazy(() => import('../layouts/FinanceLayout'))
export const SalesAnalyticsLayout = lazy(() => import('../layouts/SalesAnalyticsLayout'))
export const BookstoreLayout = lazy(() => import('../layouts/BookstoreLayout'))
