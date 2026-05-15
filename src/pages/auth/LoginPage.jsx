import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import SriramLogo from '../../components/brand/SriramLogo'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, authLoading, isAuthenticated, loading } = useAuth()
  const redirectTo =
    location.state?.from?.pathname && location.state.from.pathname !== '/login'
      ? location.state.from.pathname
      : '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, redirectTo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
  }

  return (
    <div className="figma-admin-section flex min-h-screen w-full bg-[#f7f7f7]">
      <div className="relative hidden w-[48%] max-w-[640px] shrink-0 flex-col justify-between overflow-hidden bg-[#03045e] p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(31,162,255,0.15)_0%,transparent_45%),linear-gradient(320deg,rgba(223,130,132,0.12)_0%,transparent_50%)]" />
        <div className="relative">
          <SriramLogo variant="login" />
          <h1 className="mt-8 max-w-sm text-3xl font-black leading-tight xl:text-[2.35rem]">
            Super Admin Portal
          </h1>
          <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/75">
            Manage centers, courses, students, and revenue from one unified
            dashboard built for operational excellence.
          </p>
        </div>
        <ul className="relative space-y-2.5 text-sm font-medium text-white/70">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1fa2ff]" />
            Multi-center performance analytics
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ef8b8b]" />
            Courses, resources & enquiries
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ca8a04]" />
            Secure role-based access
          </li>
        </ul>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <SriramLogo variant="login" className="mx-auto object-center" linkClassName="justify-center" />
            <h2 className="mt-5 text-xl font-bold text-[#111111]">Admin Sign In</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-6 shadow-[0_11px_25px_rgba(15,23,42,0.08)] sm:p-8"
          >
            <div className="mb-6 hidden lg:block">
              <h2 className="text-xl font-bold text-[#111111]">Sign in</h2>
              <p className="mt-1 text-sm text-[#686868]">
                Enter your credentials to continue
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#333]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9ca0a8]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="superadmin@sriram.com"
                    required
                    className="h-11 w-full rounded-lg bg-[#eef2fc] pl-11 pr-3 text-sm text-[#222] outline-none placeholder:text-[#9ca0a8] focus:ring-2 focus:ring-[#55ace7] sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#333]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9ca0a8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="h-11 w-full rounded-lg bg-[#eef2fc] pl-11 pr-11 text-sm text-[#222] outline-none placeholder:text-[#9ca0a8] focus:ring-2 focus:ring-[#55ace7] sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687180]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#55ace7] to-[#246392] text-sm font-bold text-white shadow-[0_5px_13px_rgba(36,99,146,0.35)] transition hover:opacity-95 disabled:opacity-60 sm:text-base"
            >
              {authLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="mt-5 text-center text-xs font-medium text-[#9ca0a8]">
              Sign in with your Super Admin credentials
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
