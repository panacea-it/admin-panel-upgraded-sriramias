import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { CATEGORY_HUB_TABS } from '../../constants/categoryHubSections'

export default function CategoryHubShell({ children }) {
  const location = useLocation()
  const useOutlet = !children

  return (
    <div className="figma-admin-section min-h-full bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <nav
          className="sticky top-0 z-20 -mx-1 flex flex-wrap gap-2 rounded-2xl border border-white/60 bg-white/80 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:gap-2.5 sm:p-2.5"
          aria-label="Category sections"
        >
          {CATEGORY_HUB_TABS.map((tab) => {
            const isActive =
              location.pathname === tab.path ||
              location.pathname.startsWith(`${tab.path}/`)
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={cn(
                  'inline-flex min-h-[40px] items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 sm:px-5 sm:text-[15px]',
                  isActive
                    ? 'bg-gradient-to-r from-[#55ace7] to-[#246392] text-white shadow-[0_4px_14px_rgba(36,99,146,0.35)]'
                    : 'bg-slate-50 text-[#222] hover:bg-white hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]',
                )}
              >
                {tab.label}
              </NavLink>
            )
          })}
        </nav>

        {useOutlet ? <Outlet /> : children}
      </section>
    </div>
  )
}
