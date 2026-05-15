import { cn } from '../../utils/cn'

export function CourseFormField({ label, required, children, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <label className="mb-1.5 block text-xs font-semibold text-[#555] sm:text-sm">
        {label}
        {required && <span className="text-[#c96565]"> *</span>}
      </label>
      {children}
    </div>
  )
}

export function CourseInput(props) {
  return (
    <input
      className="h-11 w-full rounded-lg bg-[#eef2fc] px-3 text-sm text-[#222] outline-none placeholder:text-[#9ca0a8] focus:ring-2 focus:ring-[#55ace7] sm:text-base"
      {...props}
    />
  )
}

export function CourseSelect({ children, ...props }) {
  return (
    <select
      className="h-11 w-full appearance-none rounded-lg bg-[#eef2fc] px-3 text-sm text-[#222] outline-none focus:ring-2 focus:ring-[#55ace7] sm:text-base"
      {...props}
    >
      {children}
    </select>
  )
}
