import { useMemo, useState } from 'react'
import {
  LayoutDashboard,
  IndianRupee,
  Clock,
  AlertTriangle,
  CalendarClock,
  Banknote,
  TrendingUp,
  GitCompare,
  Download,
  RefreshCw,
  Building2,
} from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatCard from '../../components/finance/FinanceStatCard'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import FinanceDashboardSkeleton from '../../components/finance/FinanceDashboardSkeleton'
import CenterPerformanceCards from '../../components/finance/CenterPerformanceCards'
import CenterComparisonPanel from '../../components/finance/CenterComparisonPanel'
import CenterDrillDownModal from '../../components/finance/CenterDrillDownModal'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { useFinanceDashboard } from '../../hooks/useFinanceDashboard'
import { useFinanceCenterFilter } from '../../contexts/FinanceCenterFilterContext'
import { FINANCE_COURSES } from '../../data/financeMockData'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { exportToCsv } from '../../utils/financeExport'
import { cn } from '../../utils/cn'

function BarChart({ data, valueKey, labelKey, maxValue, onBarClick }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className="flex h-48 items-end gap-2 sm:gap-3">
      {data.map((item) => (
        <button
          key={item[labelKey]}
          type="button"
          onClick={() => onBarClick?.(item)}
          className="group flex flex-1 flex-col items-center gap-1"
        >
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-[#246392] to-[#55ace7] transition group-hover:from-[#1a4d73] group-hover:to-[#3d96d4]"
            style={{ height: `${Math.max(8, (item[valueKey] / max) * 100)}%` }}
            title={formatINR(item[valueKey])}
          />
          <span className="text-[10px] font-medium text-[#686868] sm:text-xs">{item[labelKey]}</span>
        </button>
      ))}
    </div>
  )
}

function DonutLegend({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
          <span className="font-semibold">{item.value}%</span>
        </li>
      ))}
    </ul>
  )
}

export default function PaymentDashboardPage() {
  const [courseFilter, setCourseFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [drillCenter, setDrillCenter] = useState(null)
  const centerFilter = useFinanceCenterFilter()
  const { data, loading, refreshing, reload } = useFinanceDashboard(courseFilter, monthFilter)

  const stats = data?.stats
  const monthlyMax = useMemo(
    () => Math.max(...(data?.monthlyRevenue || []).map((m) => m.amount), 1),
    [data],
  )

  const viewBadge = useMemo(() => {
    if (centerFilter.compareMode) return 'Compare centers'
    if (centerFilter.isOverallView) return 'Overall platform view'
    if (centerFilter.isCenterView) return `Center: ${centerFilter.selectedCenters[0]?.centerName}`
    if (centerFilter.isMultiView) return `${centerFilter.selectedIds.length} centers selected`
    return 'Payment analytics'
  }, [centerFilter])

  const paymentColumns = [
    { key: 'studentName', label: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: 'courseName', label: 'Course' },
    { key: 'centerName', label: 'Center', render: (r) => r.centerName || '—' },
    { key: 'amountPaid', label: 'Amount', render: (r) => formatINR(r.amountPaid) },
    { key: 'paymentStatus', label: 'Status', render: (r) => <FinanceStatusBadge status={r.paymentStatus} /> },
    { key: 'paymentDate', label: 'Date', render: (r) => formatCategoryDateTime(r.paymentDate) },
  ]

  const emiColumns = [
    { key: 'emiNo', label: 'EMI #' },
    { key: 'emiAmount', label: 'Amount', render: (r) => formatINR(r.emiAmount) },
    { key: 'dueDate', label: 'Due' },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
  ]

  const handleExport = () => {
    exportToCsv(data?.recentPayments || [], 'payment-dashboard-export.csv')
  }

  const shellActions = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
        {viewBadge}
      </span>
      <button
        type="button"
        onClick={() => centerFilter.setCompareMode(!centerFilter.compareMode)}
        className={cn(
          'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold',
          centerFilter.compareMode ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-white/30 bg-white/10 text-white',
        )}
      >
        <GitCompare className="h-3.5 w-3.5" /> Compare Centers
      </button>
      <button type="button" onClick={reload} className="rounded-lg border border-white/30 bg-white/10 p-2 text-white">
        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
      </button>
      <button type="button" onClick={handleExport} className="rounded-lg border border-white/30 bg-white/10 p-2 text-white">
        <Download className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <FinancePageShell icon={LayoutDashboard} title="Payment Dashboard" actions={shellActions}>
      <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Center:</span>
          <button
            type="button"
            onClick={centerFilter.selectAll}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition',
              centerFilter.isOverallView ? 'bg-[#246392] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            All Centers
          </button>
          {centerFilter.selectedCenters.map((c) => (
            <button
              key={c.centerId}
              type="button"
              onClick={() => centerFilter.selectSingle(c.centerId)}
              className="rounded-full bg-[#246392]/10 px-3 py-1 text-xs font-semibold text-[#246392]"
            >
              {c.centerName}
            </button>
          ))}
          {refreshing && (
            <span className="ml-auto text-xs font-medium text-slate-400">Updating…</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
        >
          <option value="all">All courses</option>
          {FINANCE_COURSES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
        >
          <option value="all">All months</option>
          {(data?.monthlyRevenue || []).map((m) => (
            <option key={m.month} value={m.month}>{m.month}</option>
          ))}
        </select>
        </div>
      </div>

      {loading && !data ? (
        <FinanceDashboardSkeleton />
      ) : (
        <>
          {centerFilter.isOverallView && (
            <CenterPerformanceCards performance={data?.performance} loading={loading} />
          )}

          {centerFilter.compareMode && data?.comparison && (
            <CenterComparisonPanel comparison={data.comparison} centers={data.centers} />
          )}

          {data?.centerRanking?.length > 0 && (centerFilter.isOverallView || centerFilter.isMultiView) && (
            <div className="rounded-xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5">
              <h3 className="mb-3 text-sm font-bold text-[#246392]">Center revenue ranking</h3>
              <div className="space-y-2">
                {data.centerRanking.slice(0, 5).map((c) => (
                  <button
                    key={c.centerId}
                    type="button"
                    onClick={() => {
                      const match = centerFilter.selectedCenters.find((x) => x.centerName === c.centerName)
                        || { centerId: c.centerId, centerName: c.centerName, centerCode: c.centerCode, ...c }
                      setDrillCenter(match)
                    }}
                    className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm transition hover:bg-slate-100"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#246392] text-xs font-bold text-white">
                        {c.rank}
                      </span>
                      {c.centerName}
                    </span>
                    <span className="font-semibold text-[#246392]">{formatINR(c.totalRevenue)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FinanceStatCard label="Total revenue" value={formatINR(stats.totalRevenue)} icon={IndianRupee} className="bg-white/90 backdrop-blur-sm" />
              <FinanceStatCard label="Today's collections" value={formatINR(stats.todayCollections)} icon={TrendingUp} className="bg-white/90 backdrop-blur-sm" />
              <FinanceStatCard label="Pending payments" value={stats.pendingPayments} icon={Clock} className="bg-white/90 backdrop-blur-sm" />
              <FinanceStatCard label="Failed payments" value={stats.failedPayments} icon={AlertTriangle} accent="from-[#df8284] to-[#b8887a]" className="bg-white/90 backdrop-blur-sm" />
              <FinanceStatCard label="EMI active students" value={stats.emiActiveStudents} icon={CalendarClock} className="bg-white/90 backdrop-blur-sm" />
              <FinanceStatCard label="Offline approvals" value={stats.offlineApprovalsPending} icon={Banknote} className="bg-white/90 backdrop-blur-sm" />
              <FinanceStatCard label="Monthly collections" value={formatINR(stats.monthlyCollections)} icon={IndianRupee} className="bg-white/90 backdrop-blur-sm" />
              <FinanceStatCard
                label="Payment success rate"
                value={`${stats.paymentSuccessRate ?? data?.paymentSuccessRate ?? 94}%`}
                icon={Building2}
                className="bg-white/90 backdrop-blur-sm"
              />
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5">
              <h3 className="mb-4 text-sm font-bold text-[#246392]">Monthly revenue</h3>
              {data?.monthlyRevenue && (
                <BarChart data={data.monthlyRevenue} valueKey="amount" labelKey="month" maxValue={monthlyMax} />
              )}
            </div>
            <div className="rounded-xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5">
              <h3 className="mb-4 text-sm font-bold text-[#246392]">Payment status breakdown</h3>
              {data?.paymentStatusBreakdown && <DonutLegend items={data.paymentStatusBreakdown} />}
            </div>
            <div className="rounded-xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-bold text-[#246392]">Course-wise revenue</h3>
              {data?.courseWiseRevenue && (
                <BarChart data={data.courseWiseRevenue} valueKey="amount" labelKey="course" />
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-[#246392]">Recent successful payments</h3>
            <PaginatedFigmaTable columns={paymentColumns} data={data?.recentPayments || []} itemLabel="payments" initialPageSize={5} resetDeps={[centerFilter.selectedIds, courseFilter]} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-[#246392]">Recent failed / pending</h3>
            <PaginatedFigmaTable columns={paymentColumns} data={data?.recentFailed || []} itemLabel="records" initialPageSize={5} resetDeps={[centerFilter.selectedIds]} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-[#246392]">Pending EMI dues</h3>
            <PaginatedFigmaTable columns={emiColumns} data={data?.pendingEmiDues || []} itemLabel="EMI dues" initialPageSize={5} />
          </div>
        </>
      )}

      <CenterDrillDownModal center={drillCenter} data={data} onClose={() => setDrillCenter(null)} />
    </FinancePageShell>
  )
}
