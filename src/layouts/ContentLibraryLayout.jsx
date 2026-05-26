import { Navigate, Route, Routes } from 'react-router-dom'
import { ContentLibraryProvider } from '../contexts/ContentLibraryContext'
import ContentLibraryShell from '../components/content-library/ContentLibraryShell'
import DashboardPage from '../pages/academics/content-library/DashboardPage'
import UploadContentPage from '../pages/academics/content-library/UploadContentPage'
import AllContentPage from '../pages/academics/content-library/AllContentPage'
import ContentSubjectsPage from '../pages/academics/content-library/ContentSubjectsPage'
import ContentTopicsPage from '../pages/academics/content-library/ContentTopicsPage'
import ContentCategoriesPage from '../pages/academics/content-library/ContentCategoriesPage'
import AccessControlPage from '../pages/academics/content-library/AccessControlPage'
import PublishedContentPage from '../pages/academics/content-library/PublishedContentPage'
import DraftContentPage from '../pages/academics/content-library/DraftContentPage'
import ArchiveContentPage from '../pages/academics/content-library/ArchiveContentPage'
import ContentAnalyticsPage from '../pages/academics/content-library/ContentAnalyticsPage'
import BulkUploadPage from '../pages/academics/content-library/BulkUploadPage'
import RecycleBinPage from '../pages/academics/content-library/RecycleBinPage'

export default function ContentLibraryLayout() {
  return (
    <ContentLibraryProvider>
      <Routes>
        <Route element={<ContentLibraryShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="upload" element={<UploadContentPage />} />
          <Route path="all" element={<AllContentPage />} />
          <Route path="subjects" element={<ContentSubjectsPage />} />
          <Route path="topics" element={<ContentTopicsPage />} />
          <Route path="categories" element={<ContentCategoriesPage />} />
          <Route path="access-control" element={<AccessControlPage />} />
          <Route path="published" element={<PublishedContentPage />} />
          <Route path="drafts" element={<DraftContentPage />} />
          <Route path="archive" element={<ArchiveContentPage />} />
          <Route path="analytics" element={<ContentAnalyticsPage />} />
          <Route path="bulk-upload" element={<BulkUploadPage />} />
          <Route path="recycle-bin" element={<RecycleBinPage />} />
        </Route>
      </Routes>
    </ContentLibraryProvider>
  )
}
