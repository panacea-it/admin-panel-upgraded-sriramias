import { ChevronRight } from 'lucide-react'

export default function CategoryBreadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9ca0a8]" aria-hidden />
            )}
            <span
              className={
                isLast
                  ? 'font-semibold text-[#246392]'
                  : 'font-medium text-[#686868]'
              }
            >
              {item.label}
            </span>
          </span>
        )
      })}
    </nav>
  )
}
