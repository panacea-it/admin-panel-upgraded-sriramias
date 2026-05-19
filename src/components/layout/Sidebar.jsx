import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../utils/cn'
import {
  SIDEBAR_DASHBOARD,
  getGroupIdForPath,
  getSubmenuIdForPath,
  isNavItemActive,
} from '../../constants/navigation'
import { usePermissions } from '../../hooks/usePermissions'

const groupShell = 'rounded-xl bg-[#2d2f58]'
const childActive = 'rounded-lg bg-[#1e2145] text-white'
const childIdle = 'rounded-lg text-white/90 hover:bg-white/[0.06] hover:text-white'

function SubNavLink({ to, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      end
      className={({ isActive }) =>
        cn(
          'block px-4 py-2.5 text-[13px] font-medium leading-snug transition-colors duration-150',
          isActive ? childActive : childIdle,
        )
      }
    >
      {label}
    </NavLink>
  )
}

function CategorySubNavLink({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium leading-snug transition-colors duration-150',
          isActive
            ? 'bg-gradient-to-r from-[#d1e9f6] to-[#b3d9eb] text-[#05092b]'
            : 'text-[#05092b] hover:bg-[#05092b]/[0.05]',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  )
}

function CategoriesSubmenu({ submenu, isOpen, onToggle, onNavigate }) {
  const location = useLocation()
  const hasActiveChild = submenu.children.some((child) =>
    isNavItemActive(child, location.pathname),
  )

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-[13px] font-medium leading-snug transition-colors duration-150',
          isOpen || hasActiveChild ? 'bg-white/[0.08] text-white' : childIdle,
        )}
      >
        <span>{submenu.label}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.5} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.5} />
        )}
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'mt-0.5 flex flex-col gap-0.5 rounded-xl bg-white p-2 transition-opacity duration-300',
              isOpen ? 'opacity-100' : 'opacity-0',
            )}
          >
            {submenu.children.map((child) => (
              <CategorySubNavLink
                key={child.path}
                to={child.path}
                label={child.label}
                icon={child.icon}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NavGroup({ group, isOpen, onToggle, onNavigate }) {
  const { label, icon: Icon, children } = group
  const location = useLocation()
  const routeSubmenuId = getSubmenuIdForPath(location.pathname)
  const [openSubmenuId, setOpenSubmenuId] = useState(routeSubmenuId)

  useEffect(() => {
    if (routeSubmenuId) setOpenSubmenuId(routeSubmenuId)
  }, [routeSubmenuId])

  const visibleChildren = children
  const hasActiveChild = visibleChildren.some((c) =>
    isNavItemActive(c, location.pathname),
  )

  const toggleSubmenu = (id) => {
    setOpenSubmenuId((prev) => (prev === id ? null : id))
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14px] font-semibold text-white transition-colors',
          hasActiveChild ? groupShell : 'hover:bg-white/[0.05]',
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.5} />
      </button>
    )
  }

  return (
    <div className={cn(groupShell, 'overflow-hidden py-1')}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-h-[44px] items-center gap-3 px-3.5 py-2.5 text-left text-[14px] font-semibold text-white"
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronUp className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.5} />
      </button>
      <div className="flex flex-col gap-0.5 px-2 pb-2 pt-0">
        {visibleChildren.map((child) =>
          child.children ? (
            <CategoriesSubmenu
              key={child.id}
              submenu={child}
              isOpen={openSubmenuId === child.id}
              onToggle={() => toggleSubmenu(child.id)}
              onNavigate={onNavigate}
            />
          ) : (
            <SubNavLink
              key={child.path}
              to={child.path}
              label={child.label}
              onNavigate={onNavigate}
            />
          ),
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, isMobile, onClose }) {
  const location = useLocation()
  const { sidebarGroups, showDashboard } = usePermissions()
  const routeGroupId = getGroupIdForPath(location.pathname, sidebarGroups)
  const [openGroupId, setOpenGroupId] = useState(routeGroupId)
  const [prevRouteGroupId, setPrevRouteGroupId] = useState(routeGroupId)

  if (routeGroupId !== prevRouteGroupId) {
    setPrevRouteGroupId(routeGroupId)
    if (routeGroupId) setOpenGroupId(routeGroupId)
  }

  const handleNavigate = isMobile ? onClose : undefined

  const toggleGroup = (id) => {
    setOpenGroupId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'custom-scrollbar z-50 flex shrink-0 flex-col overflow-y-auto bg-[#05092b] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out',
          isMobile
            ? 'fixed left-4 top-4 bottom-4 w-[min(100%,288px)] rounded-2xl'
            : 'h-full max-h-screen w-[272px] min-w-[260px] max-w-[288px] shrink-0 self-stretch rounded-tr-[20px] rounded-br-[20px]',
          isMobile && !isOpen && '-translate-x-[calc(100%+2rem)]',
          !isMobile && 'translate-x-0',
        )}
        style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
      >
        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-7 sm:px-3.5">
          {showDashboard && (
            <NavLink
              to={SIDEBAR_DASHBOARD.path}
              onClick={handleNavigate}
              end
              className={({ isActive }) =>
                cn(
                  'flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition-colors duration-150',
                  isActive ? groupShell : 'text-white hover:bg-white/[0.05]',
                )
              }
            >
              <SIDEBAR_DASHBOARD.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              <span>{SIDEBAR_DASHBOARD.label}</span>
            </NavLink>
          )}

          {sidebarGroups.map((group) => (
            <NavGroup
              key={group.id}
              group={group}
              isOpen={openGroupId === group.id}
              onToggle={() => toggleGroup(group.id)}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}
