import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  IndianRupee,
  Clock,
  AlertTriangle,
  CalendarClock,
  Banknote,
  TrendingUp,
} from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatCard from '../../components/finance/FinanceStatCard'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchFinanceDashboard } from '../../api/financeAPI'
import { FINANCE_COURSES } from '../../data/financeMockData'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { toast } from '../../utils/toast'

function BarChart({ data, valueKey, labelKey, maxValue }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className="flex h-48 items-end gap-2 sm:gap-3">
      {data.map((item) => (
        <div key={item[labelKey]} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-[#246392] to-[#55ace7]"
            style={{ height: `${Math.max(8, (item[valueKey] / max) * 100)}%` }}
            title={formatINR(item[valueKey])}
          />
          <span className="text-[10px] font-medium text-[#686868] sm:text-xs">{item[labelKey]}</span>
        </div>
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
  const [data, setData] = useState(null)
  const [courseFilter, setCourseFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')

  const load = useCallback(async () => {
    try {
      const res = await fetchFinanceDashboard({ course: courseFilter, month: monthFilter })
      setData(res)
    } catch {
      toast.error('Failed to load dashboard')
    }
  }, [courseFilter, monthFilter])

  useEffect(() => {
    load()
  }, [load])

  const stats = data?.stats
  const monthlyMax = useMemo(
    () => Math.max(...(data?.monthlyRevenue || []).map((m) => m.amount), 1),
    [data],
  )

  const paymentColumns = [
    { key: 'studentName', label: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: 'courseName', label: 'Course' },
    {
      key: 'amountPaid',
      label: 'Amount',
      render: (r) => formatINR(r.amountPaid),
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (r) => <FinanceStatusBadge status={r.paymentStatus} />,
    },
    {
      key: 'paymentDate',
      label: 'Date',
      render: (r) => formatCategoryDateTime(r.paymentDate),
    },
  ]

  const emiColumns = [
    { key: 'emiNo', label: 'EMI #' },
    { key: 'emiAmount', label: 'Amount', render: (r) => formatINR(r.emiAmount) },
    { key: 'dueDate', label: 'Due' },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
  ]

  return (
    <FinancePageShell icon={LayoutDashboard} title="Payment Dashboard">
      <div className="flex flex-wrap gap-3">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
        >
          <option value="all">All courses</option>
          {FINANCE_COURSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
        >
          <option value="all">All months</option>
          {(data?.monthlyRevenue || []).map((m) => (
            <option key={m.month} value={m.month}>
              {m.month}
            </option>
          ))}
        </select>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinanceStatCard label="Total revenue" value={formatINR(stats.totalRevenue)} icon={IndianRupee} />
          <FinanceStatCard label="Today's collections" value={formatINR(stats.todayCollections)} icon={TrendingUp} />
          <FinanceStatCard label="Pending payments" value={stats.pendingPayments} icon={Clock} />
          <FinanceStatCard label="Failed payments" value={stats.failedPayments} icon={AlertTriangle} accent="from-[#df8284] to-[#b8887a]" />
          <FinanceStatCard label="EMI active students" value={stats.emiActiveStudents} icon={CalendarClock} />
          <FinanceStatCard label="Offline approvals" value={stats.offlineApprovalsPending} icon={Banknote} />
          <FinanceStatCard label="Monthly collections" value={formatINR(stats.monthlyCollections)} icon={IndianRupee} />
          <FinanceStatCard label="Total payments" value={stats.totalPayments} icon={LayoutDashboard} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-sm font-bold text-[#246392]">Monthly revenue</h3>
          {data?.monthlyRevenue && (
            <BarChart data={data.monthlyRevenue} valueKey="amount" labelKey="month" maxValue={monthlyMax} />
          )}
        </div>
        <div className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-sm font-bold text-[#246392]">Payment status breakdown</h3>
          {data?.paymentStatusBreakdown && <DonutLegend items={data.paymentStatusBreakdown} />}
        </div>
        <div className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-[#246392]">Course-wise revenue</h3>
          {data?.courseWiseRevenue && (
            <BarChart data={data.courseWiseRevenue} valueKey="amount" labelKey="course" />
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#246392]">Recent successful payments</h3>
        <PaginatedFigmaTable
          columns={paymentColumns}
          data={data?.recentPayments || []}
          itemLabel="payments"
          initialPageSize={5}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#246392]">Recent failed / pending</h3>
        <PaginatedFigmaTable
          columns={paymentColumns}
          data={data?.recentFailed || []}
          itemLabel="records"
          initialPageSize={5}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#246392]">Pending EMI dues</h3>
        <PaginatedFigmaTable
          columns={emiColumns}
          data={data?.pendingEmiDues || []}
          itemLabel="EMI dues"
          initialPageSize={5}
        />
      </div>
    </FinancePageShell>
  )
}
