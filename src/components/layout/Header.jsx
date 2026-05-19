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
import { useTheme } from '../../hooks/useTheme'
import { initialNotifications } from '../../data/notifications'
import NotificationPanel from './NotificationPanel'
import SriramLogo from '../brand/SriramLogo'
import { cn } from '../../utils/cn'
import { useCenters } from '../../contexts/CentersContext'
import { ROLE_LABELS } from '../../constants/roles'
import { usePermissions } from '../../hooks/usePermissions'

function IconAction({ icon: Icon, label, className }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#03045e]/8 bg-[#f4f6fb] text-[#03045e] transition hover:border-[#03045e]/15 hover:bg-[#e8ecf7]',
        className,
      )}
    >
      <Icon className="h-[17px] w-[17px]" strokeWidth={2.25} />
    </button>
  )
}

export default function Header({ onMenuClick }) {
  const { user, selectedCenter, setSelectedCenter, logout } = useAuth()
  const { isSuperAdmin, roleLabel } = usePermissions()
  const { headerCenterOptions } = useCenters()
  const navigate = useNavigate()
  const [centerOpen, setCenterOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(initialNotifications)
  const headerRef = useRef(null)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const displayName = user?.name || 'Sriram Kumar'
  const displayRole = roleLabel || ROLE_LABELS[user?.role] || 'Admin'
  const initials = user?.avatar || 'SK'

  useEffect(() => {
    if (
      selectedCenter &&
      selectedCenter !== 'All Centers' &&
      !headerCenterOptions.includes(selectedCenter)
    ) {
      setSelectedCenter('All Centers')
    }
  }, [headerCenterOptions, selectedCenter, setSelectedCenter])

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
      className="relative z-30 flex h-[68px] min-h-[68px] shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-white px-3 shadow-[0_2px_16px_rgba(3,4,94,0.06)] sm:px-4 lg:px-6"
      style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#03045e] transition hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" strokeWidth={2.2} />
        </button>

        <Link
          to="/dashboard"
          className="flex min-w-0 items-center py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#03045e]/40"
        >
          <SriramLogo variant="header" />
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {isSuperAdmin && (
          <div className="hidden items-center gap-1.5 sm:flex md:gap-2">
            <IconAction icon={Plus} label="Add" />
            <IconAction icon={Users} label="Team" className="hidden md:flex" />
            <IconAction icon={Download} label="Download" className="hidden lg:flex" />
            <IconAction icon={Search} label="Search" className="hidden xl:flex" />
          </div>
        )}

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => {
              setCenterOpen((v) => !v)
              setProfileOpen(false)
              setNotifOpen(false)
            }}
            className="flex h-9 max-w-[min(42vw,200px)] items-center gap-2 rounded-lg border border-[#03045e]/10 bg-[#f4f6fb] px-3 text-[12px] font-semibold text-[#03045e] transition hover:border-[#03045e]/18 hover:bg-[#e8ecf7] sm:max-w-[220px] sm:px-3.5 sm:text-[13px]"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#b91c1c]" strokeWidth={2.5} />
            <span className="truncate text-slate-800">{selectedCenter}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2.5} />
          </button>
          {centerOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(100vw-2rem,228px)] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-[0_12px_32px_rgba(3,4,94,0.12)]">
              {headerCenterOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedCenter(c)
                    setCenterOpen(false)
                  }}
                  className={cn(
                    'block w-full px-4 py-2.5 text-left text-[13px] font-medium transition hover:bg-[#f4f6fb]',
                    selectedCenter === c
                      ? 'bg-[#eef1fa] font-semibold text-[#03045e]'
                      : 'text-slate-800',
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
              'relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition',
              notifOpen
                ? 'border-[#03045e]/12 bg-[#eef1fa] text-[#03045e]'
                : 'text-[#03045e] hover:border-[#03045e]/8 hover:bg-[#f4f6fb]',
            )}
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="h-[17px] w-[17px]" strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-bold text-white ring-2 ring-white">
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
          onClick={toggleTheme}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-amber-600 transition hover:bg-amber-50 sm:flex dark:hover:bg-slate-800"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Moon className="h-[17px] w-[17px]" strokeWidth={2.2} />
          ) : (
            <Sun className="h-[17px] w-[17px]" strokeWidth={2.2} />
          )}
        </button>

        <div className="mx-0.5 hidden h-7 w-px bg-slate-200 sm:block" aria-hidden />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v)
              setCenterOpen(false)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-lg border border-transparent py-1 pl-1 pr-1.5 transition hover:border-slate-200/80 hover:bg-slate-50/80 sm:pr-2"
          >
            <div className="relative shrink-0">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#03045e] via-[#1e3a8a] to-[#b91c1c] text-[12px] font-bold text-white shadow-sm"
                aria-hidden
              >
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-[128px] truncate text-[13px] font-semibold leading-tight text-[#03045e]">
                {displayName}
              </p>
              <p className="max-w-[128px] truncate text-[11px] font-medium text-slate-500">
                {displayRole}
              </p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-slate-500 md:block" strokeWidth={2.5} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-[0_12px_32px_rgba(3,4,94,0.12)]">
              <div className="border-b border-slate-100 px-4 py-3 md:hidden">
                <p className="text-sm font-semibold text-[#03045e]">{displayName}</p>
                <p className="text-xs text-slate-500">{displayRole}</p>
              </div>
              <Link
                to="/settings/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-slate-800 hover:bg-[#f4f6fb]"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-4 w-4 text-[#03045e]" /> Profile
              </Link>
              <Link
                to="/settings/general"
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-slate-800 hover:bg-[#f4f6fb]"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="h-4 w-4 text-[#03045e]" /> Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-[#b91c1c] hover:bg-red-50"
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
