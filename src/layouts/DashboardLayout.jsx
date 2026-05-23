import { Suspense, useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import LoadingState from '../components/feedback/LoadingState'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  )

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    onResize()
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div
      className="flex h-screen max-h-[100dvh] w-full overflow-hidden bg-[#f7f7f7] text-[#111111]"
      style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
    >
      <Sidebar isOpen={sidebarOpen} isMobile={isMobile} onClose={closeSidebar} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f7f7f7] dark:bg-[var(--app-bg)]">
          <Suspense fallback={<LoadingState message="Loading page..." className="m-6" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
