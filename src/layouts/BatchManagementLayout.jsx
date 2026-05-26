import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { BatchManagementProvider } from '../contexts/BatchManagementContext'

const BatchesPage = lazy(() => import('../pages/academics/BatchesPage'))
const BatchDetailsPage = lazy(() => import('../pages/academics/BatchDetailsPage'))

function BatchListFallback() {
  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 py-12 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#55ace7] border-t-transparent" />
      <p className="mt-4 text-sm text-[#686868]">Loading…</p>
    </div>
  )
}

export default function BatchManagementLayout() {
  return (
    <BatchManagementProvider>
      <Suspense fallback={<BatchListFallback />}>
        <Routes>
          <Route index element={<BatchesPage />} />
          <Route path=":batchId" element={<BatchDetailsPage />} />
          <Route path="*" element={<Navigate to="/academics/batch" replace />} />
        </Routes>
      </Suspense>
    </BatchManagementProvider>
  )
}
