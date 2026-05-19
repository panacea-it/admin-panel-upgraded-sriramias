import { formatINR } from '../../utils/financeFilters'
import { cn } from '../../utils/cn'

function ChartCard({ title, subtitle, children, className }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      <div className="bg-gradient-to-r from-[#55ace7] to-[#246392] px-4 py-3 sm:px-5">
        <h3 className="text-sm font-bold text-white sm:text-base">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-white/80">{subtitle}</p>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

export function MonthlyRevenueBarChart({ data = [], className }) {
  const max = Math.max(...data.map((d) => d.amount || 0), 1)
  return (
    <ChartCard title="Monthly Revenue" subtitle="Collections by month" className={className}>
      <div className="flex h-48 items-end justify-between gap-2 sm:h-56 sm:gap-3">
        {data.map((item) => {
          const pct = ((item.amount || 0) / max) * 100
          return (
            <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-[#246392] sm:text-xs" title={formatINR(item.amount)}>
                {item.amount >= 1000000 ? `${(item.amount / 1000000).toFixed(1)}M` : `${Math.round(item.amount / 1000)}K`}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#246392] to-[#55ace7] transition-all"
                  style={{ height: `${Math.max(pct, 4)}%` }}
                  title={formatINR(item.amount)}
                />
              </div>
              <span className="text-xs font-medium text-[#686868]">{item.month}</span>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}

export function PaymentStatusPieChart({ data = [], className }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1
  let cumulative = 0
  const segments = data.map((d) => {
    const start = cumulative
    cumulative += (d.value / total) * 100
    return { ...d, start, end: cumulative }
  })

  const gradient = segments.length
    ? `conic-gradient(${segments
        .map((s) => `${s.color || '#55ace7'} ${s.start}% ${s.end}%`)
        .join(', ')})`
    : 'conic-gradient(#eef2fc 0% 100%)'

  return (
    <ChartCard title="Payment Status" subtitle="Share of payment states" className={className}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full shadow-inner sm:h-40 sm:w-40"
          style={{ background: gradient }}
        >
          <div className="absolute inset-[22%] flex items-center justify-center rounded-full bg-white text-center">
            <span className="text-lg font-bold text-[#1a3a5c]">{total}%</span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-2 sm:max-w-[200px]">
          {data.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-[#222]">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span className="font-semibold text-[#246392]">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

export function CourseRevenueChart({ data = [], className }) {
  const max = Math.max(...data.map((d) => d.amount || 0), 1)
  return (
    <ChartCard title="Course-wise Revenue" subtitle="Top courses by collection" className={className}>
      <ul className="space-y-3">
        {data.map((item) => {
          const pct = ((item.amount || 0) / max) * 100
          return (
            <li key={item.course}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-medium text-[#222]" title={item.course}>
                  {item.course}
                </span>
                <span className="shrink-0 font-semibold text-[#1a3a5c]">{formatINR(item.amount)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#eef2fc]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#55ace7] to-[#246392]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </ChartCard>
  )
}

export function EmiTrendChart({ data = [], className }) {
  const max = Math.max(...data.map((d) => d.collected || 0), 1)
  const w = 280
  const h = 120
  const pad = 8
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2)
    const y = h - pad - ((d.collected || 0) / max) * (h - pad * 2)
    return { x, y, ...d }
  })
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? pad} ${h - pad} L ${points[0]?.x ?? pad} ${h - pad} Z`

  return (
    <ChartCard title="EMI Collections Trend" subtitle="Monthly EMI collected" className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto w-full max-w-md" aria-hidden>
        <defs>
          <linearGradient id="emiAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#55ace7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#55ace7" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#emiAreaGrad)" />
        <path d={linePath} fill="none" stroke="#246392" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.month} cx={p.x} cy={p.y} r="4" fill="#55ace7" stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs font-medium text-[#686868]">
        {data.map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>
    </ChartCard>
  )
}

export default function FinanceCharts({ monthlyRevenue, paymentStatusBreakdown, courseWiseRevenue, emiTrend }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
      <MonthlyRevenueBarChart data={monthlyRevenue} />
      <PaymentStatusPieChart data={paymentStatusBreakdown} />
      <CourseRevenueChart data={courseWiseRevenue} className="sm:col-span-2 xl:col-span-1" />
      <EmiTrendChart data={emiTrend} className="sm:col-span-2 xl:col-span-1" />
    </div>
  )
}
