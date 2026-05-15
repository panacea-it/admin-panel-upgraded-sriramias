import { cn } from '../../utils/cn'
import { CourseInput } from '../courses/CourseFormField'

export default function FileInputWithIcon({
  icon: Icon,
  value,
  onChange,
  accept,
  placeholder,
  className,
}) {
  return (
    <div className="relative">
      <CourseInput readOnly value={value} placeholder={placeholder} className={cn('pr-12', className)} />
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={onChange}
      />
      <Icon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55ace7]" />
    </div>
  )
}
