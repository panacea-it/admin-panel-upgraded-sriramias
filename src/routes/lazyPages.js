import { lazy } from 'react'

export const CoursesPage = lazy(() => import('../pages/academics/CoursesPage'))
export const ContentLibraryPage = lazy(() => import('../pages/academics/ContentLibraryPage'))
export const CurrentAffairsPage = lazy(() => import('../pages/academics/CurrentAffairsPage'))
export const BooksPage = lazy(() => import('../pages/marketing/BooksPage'))
export const CouponsPage = lazy(() => import('../pages/users/CouponsPage'))
export const EnquiriesPage = lazy(() => import('../pages/crm/EnquiriesPage'))
export const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'))
export const AdminManagementPage = lazy(() => import('../pages/users/AdminManagementPage'))
export const AdminAccessTypesPage = lazy(() => import('../pages/users/AdminAccessTypesPage'))
export const RoleAccessMatrixPage = lazy(() => import('../pages/users/RoleAccessMatrixPage'))
export const CenterManagementPage = lazy(() => import('../pages/users/CenterManagementPage'))
export const ModuleListPage = lazy(() => import('../pages/ModuleListPage'))
