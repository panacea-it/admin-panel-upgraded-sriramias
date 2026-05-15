import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { AdminRolesProvider } from './contexts/AdminRolesContext'
import { CentersProvider } from './contexts/CentersContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminRolesProvider>
          <CentersProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              richColors
              closeButton
              expand={false}
              toastOptions={{
                duration: 4000,
                classNames: {
                  toast:
                    'group border border-slate-200/80 bg-white font-sans text-sm shadow-xl shadow-violet-500/[0.08] backdrop-blur-md dark:border-slate-700/90 dark:bg-slate-950/92 dark:shadow-black/40',
                  title: 'font-semibold text-slate-900 dark:text-white',
                  description: 'text-slate-600 dark:text-slate-400',
                  success:
                    '!border-emerald-200/80 !shadow-emerald-500/10 dark:!border-emerald-900/60',
                  error: '!border-rose-200/80 dark:!border-rose-900/60',
                  warning: '!border-amber-200/80 dark:!border-amber-900/60',
                },
              }}
            />
          </CentersProvider>
        </AdminRolesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
