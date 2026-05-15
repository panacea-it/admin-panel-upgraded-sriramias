import { cn } from '../../utils/cn'

/** Official SRIRAM'S IAS lockup — asset: /public/sriram-logo.png */
const LOGO_SRC = '/sriram-logo.png'

const sizes = {
  header: 'h-10 w-auto max-w-[min(72vw,240px)] sm:h-11 sm:max-w-[280px] md:h-12 md:max-w-[320px] lg:max-w-[360px]',
  login: 'h-14 w-auto max-w-[min(90vw,320px)] sm:h-16 sm:max-w-[380px]',
  compact: 'h-8 w-auto max-w-[min(60vw,180px)] sm:h-9 sm:max-w-[220px]',
}

export default function SriramLogo({
  variant = 'header',
  className,
  linkClassName,
  asLink = false,
  to = '/dashboard',
}) {
  const img = (
    <img
      src={LOGO_SRC}
      alt="SRIRAM'S IAS — Serving The Nation Since 1985"
      width={360}
      height={72}
      decoding="async"
      className={cn(
        'block shrink-0 object-contain object-left',
        sizes[variant] ?? sizes.header,
        className,
      )}
    />
  )

  if (asLink) {
    return (
      <a
        href={to}
        className={cn(
          'inline-flex min-w-0 max-w-full items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500',
          linkClassName,
        )}
        aria-label="SRIRAM'S IAS — go to dashboard"
      >
        {img}
      </a>
    )
  }

  return <span className={cn('inline-flex min-w-0 max-w-full items-center', linkClassName)}>{img}</span>
}
