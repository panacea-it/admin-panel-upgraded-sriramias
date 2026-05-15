import { useState } from 'react'
import { cn } from '../../../utils/cn'

const sizeStyles = {
  default: {
    input:
      'rounded-xl px-3.5 pb-2.5 pt-5 text-sm peer-placeholder-shown:text-sm peer-focus:text-[11px]',
    labelBase: 'left-3.5',
    labelFloat: 'top-2 text-[11px]',
    labelCenter: 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2',
    labelIcon: 'left-10 peer-focus:left-10',
    icon: 'left-3.5 h-4 w-4',
    iconPadding: 'pl-10',
  },
  comfortable: {
    input:
      'min-h-[3.25rem] rounded-xl px-4 pb-3 pt-[1.35rem] text-[15px] leading-snug peer-placeholder-shown:text-[15px] peer-focus:text-xs',
    labelBase: 'left-4',
    labelFloat: 'top-2.5 text-xs',
    labelCenter:
      'peer-placeholder-shown:top-[calc(50%-1px)] peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px]',
    labelIcon: 'left-11 peer-focus:left-11',
    icon: 'left-4 h-[18px] w-[18px]',
    iconPadding: 'pl-11',
  },
}

export default function FloatingInput({
  id,
  label,
  helper,
  error,
  icon: Icon,
  className,
  type = 'text',
  size = 'default',
  ...props
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = props.value !== undefined && props.value !== ''
  const s = sizeStyles[size] || sizeStyles.default

  return (
    <div className={cn('relative', className)}>
      {Icon && (
        <Icon
          className={cn(
            'pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-slate-400',
            s.icon,
          )}
        />
      )}
      <input
        id={id}
        type={type}
        className={cn(
          'peer w-full rounded-xl border bg-white/80 text-slate-900 shadow-sm backdrop-blur-sm transition-all outline-none',
          'border-slate-200/80 placeholder-transparent',
          'focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15',
          'dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100',
          Icon && s.iconPadding,
          error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/15',
          s.input,
        )}
        placeholder={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute text-slate-500 transition-all duration-200',
          s.labelBase,
          s.labelCenter,
          'peer-focus:translate-y-0 peer-focus:font-semibold peer-focus:text-violet-600',
          size === 'default' &&
            'peer-focus:top-2 peer-focus:text-[11px] peer-placeholder-shown:text-sm',
          size === 'comfortable' && 'peer-focus:top-2.5 peer-focus:text-xs peer-placeholder-shown:text-[15px]',
          (focused || hasValue) && cn('translate-y-0 font-semibold text-violet-600', s.labelFloat),
          Icon && s.labelIcon,
          'dark:text-slate-400 dark:peer-focus:text-violet-400',
        )}
      >
        {label}
      </label>
      {(helper || error) && (
        <p
          className={cn(
            'mt-2 text-[13px] leading-snug',
            error ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400',
          )}
        >
          {error || helper}
        </p>
      )}
    </div>
  )
}
