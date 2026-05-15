import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: 'font-sans text-sm',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
