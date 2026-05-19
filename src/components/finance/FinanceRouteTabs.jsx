import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { FINANCE_NAV_ITEMS } from '../../constants/financeNav'

export default function FinanceRouteTabs() {
  return (
    <nav className="flex flex-wrap gap-2 sm:gap-2.5" aria-label="Finance sections">
      {FINANCE_NAV_ITEMS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end
          className={({ isActive }) =>
            cn(
              'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 sm:px-4 sm:text-[15px]',
              isActive
                ? 'bg-[#246392] text-white shadow-[0_4px_10px_rgba(36,99,146,0.35)]'
                : 'bg-white text-[#246392] shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:bg-[#eef6fc]',
            )
          }
        >
          {tab.icon && <tab.icon className="h-4 w-4 shrink-0" strokeWidth={2} />}
          <span className="truncate">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
