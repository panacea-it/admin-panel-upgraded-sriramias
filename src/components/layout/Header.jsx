import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Bell,
  ChevronDown,
  Download,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  Settings,
  Sun,
  Moon,
  User,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { initialNotifications } from '../../data/notifications'
import NotificationPanel from './NotificationPanel'
import SriramLogo from '../brand/SriramLogo'
import { cn } from '../../utils/cn'

const centers = [
  'All Centers',
  'Delhi Center',
  'Mumbai Center',
  'Bangalore Center',
  'Chennai Center',
]

const roleLabels = {
  superadmin: 'Super Admin',
  centeradmin: 'Center Admin',
}

function IconAction({ icon: Icon, label, className }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition hover:bg-violet-100',
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </button>
  )
}

export default function Header({ onMenuClick }) {
  const { user, selectedCenter, setSelectedCenter, logout } = useAuth()
  const navigate = useNavigate()
  const [centerOpen, setCenterOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const headerRef = useRef(null)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const displayName = user?.name || 'Sriram Kumar'
  const displayRole =
    roleLabels[user?.role] ||
    (user?.role ? user.role.replace(/([a-z])([A-Z])/g, '$1 $2') : 'Super Admin')
  const initials = user?.avatar || 'SK'

  useEffect(() => {
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setProfileOpen(false)
        setCenterOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeMenus = () => {
    setProfileOpen(false)
    setCenterOpen(false)
    setNotifOpen(false)
  }

  const handleLogout = () => {
    closeMenus()
    logout()
    navigate('/login', { replace: true })
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const toggleNotif = () => {
    setNotifOpen((v) => !v)
    setProfileOpen(false)
    setCenterOpen(false)
  }

  return (
    <header
      ref={headerRef}
      className="relative z-30 flex h-[64px] min-h-[64px] shrink-0 items-center justify-between gap-2 border-b border-slate-100/80 bg-white px-3 shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:gap-3 sm:px-4 lg:px-5"
      style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#03045e] transition hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" strokeWidth={2.2} />
        </button>

        <Link to="/dashboard" className="flex min-w-0 flex-1 items-center sm:flex-none">
          <SriramLogo variant="header" />
        </Link>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-1.5 sm:flex md:gap-2">
          <IconAction icon={Plus} label="Add" />
          <IconAction icon={Users} label="Team" className="hidden md:flex" />
          <IconAction icon={Download} label="Download" className="hidden lg:flex" />
          <IconAction icon={Search} label="Search" className="hidden xl:flex" />
        </div>

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => {
              setCenterOpen((v) => !v)
              setProfileOpen(false)
              setNotifOpen(false)
            }}
            className="flex h-9 max-w-[min(42vw,180px)] items-center gap-1.5 rounded-xl bg-violet-50 px-3 text-[12px] font-semibold text-slate-800 transition hover:bg-violet-100 sm:max-w-[200px] sm:px-3.5 sm:text-[13px]"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-600" strokeWidth={2.5} />
            <span className="truncate">{selectedCenter}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-600" strokeWidth={2.5} />
          </button>
          {centerOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(100vw-2rem,220px)] overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
              {centers.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedCenter(c)
                    setCenterOpen(false)
                  }}
                  className={cn(
                    'block w-full px-4 py-2.5 text-left text-[13px] font-medium transition hover:bg-violet-50',
                    selectedCenter === c ? 'bg-violet-50 text-violet-700' : 'text-slate-800',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={toggleNotif}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-xl transition',
              notifOpen ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-50',
            )}
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444] to-[#f97316] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 origin-top-right">
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllRead}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDarkMode((v) => !v)}
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-amber-500 transition hover:bg-amber-50 sm:flex"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Moon className="h-[18px] w-[18px]" strokeWidth={2.2} />
          ) : (
            <Sun className="h-[18px] w-[18px]" strokeWidth={2.2} />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v)
              setCenterOpen(false)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-1.5 transition hover:bg-slate-50 sm:pr-2"
          >
            <div className="relative shrink-0">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#ec4899] text-[12px] font-bold text-white shadow-sm"
                aria-hidden
              >
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-[120px] truncate text-[13px] font-semibold leading-tight text-slate-900">
                {displayName}
              </p>
              <p className="max-w-[120px] truncate text-[11px] font-medium text-slate-500">
                {displayRole}
              </p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-slate-500 md:block" strokeWidth={2.5} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
              <div className="border-b border-slate-100 px-4 py-3 md:hidden">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{displayRole}</p>
              </div>
              <Link
                to="/settings/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-slate-800 hover:bg-violet-50"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-4 w-4 text-violet-600" /> Profile
              </Link>
              <Link
                to="/settings/general"
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-slate-800 hover:bg-violet-50"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="h-4 w-4 text-violet-600" /> Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
