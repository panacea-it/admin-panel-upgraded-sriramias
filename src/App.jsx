import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppToaster from './components/ui/AppToaster'
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
            <AppToaster />
          </CentersProvider>
        </AdminRolesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
