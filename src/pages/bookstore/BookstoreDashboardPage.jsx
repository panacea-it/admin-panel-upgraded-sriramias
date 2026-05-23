import { useMemo, useState } from 'react'
import {
  LayoutDashboard,
  IndianRupee,
  ShoppingCart,
  Package,
  Layers,
  Clock,
  Truck,
  AlertTriangle,
  TrendingUp,
  Download,
  RefreshCw,
} from 'lucide-react'
import BookstorePageShell from '../../components/bookstore/BookstorePageShell'
import BookstoreStatCard from '../../components/bookstore/BookstoreStatCard'
import BookstoreDashboardSkeleton from '../../components/bookstore/BookstoreDashboardSkeleton'
import BookstoreBarChart from '../../components/bookstore/BookstoreBarChart'
import BookstoreStatusBadge from '../../components/bookstore/BookstoreStatusBadge'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { useBookstoreDashboard } from '../../hooks/bookstore/useBookstoreDashboard'
import { formatINR } from '../../utils/financeFilters'
import { exportToCsv } from '../../utils/financeExport'
import { cn } from '../../utils/cn'

export default function BookstoreDashboardPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data, loading, refreshing, reload } = useBookstoreDashboard({ dateFrom, dateTo })

  const stats = data?.stats
  const revenueMax = useMemo(
    () => Math.max(...(data?.revenueChart || []).map((m) => m.amount), 1),
    [data],
  )

  const orderColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'customerName', label: 'Customer' },
    { key: 'total', label: 'Total', render: (r) => formatINR(r.total) },
    { key: 'status', label: 'Status', render: (r) => <BookstoreStatusBadge status={r.status} /> },
  ]

  const lowStockColumns = [
    { key: 'id', label: 'SKU' },
    { key: 'name', label: 'Product' },
    { key: 'stockQuantity', label: 'Stock' },
    { key: 'status', label: 'Status', render: (r) => <BookstoreStatusBadge status={r.status} /> },
  ]

  const bestSellerColumns = [
    { key: 'name', label: 'Product' },
    { key: 'unitsSold', label: 'Units Sold' },
    { key: 'discountPrice', label: 'Price', render: (r) => formatINR(r.discountPrice) },
  ]

  if (loading) {
    return (
      <BookstorePageShell icon={LayoutDashboard} title="Bookstore Dashboard">
        <BookstoreDashboardSkeleton />
      </BookstorePageShell>
    )
  }

  return (
    <BookstorePageShell
      icon={LayoutDashboard}
      title="Bookstore Dashboard"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-xs text-white" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-xs text-white" />
          <button type="button" onClick={() => exportToCsv(data?.recentOrders || [], 'bookstore-orders.csv')} className="inline-flex items-center gap-1 rounded-lg border border-white/30 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button type="button" onClick={reload} className={cn('inline-flex items-center gap-1 rounded-lg border border-white/30 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10', refreshing && 'opacity-70')}>
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} /> Refresh
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BookstoreStatCard label="Total Revenue" value={formatINR(stats?.totalRevenue)} icon={IndianRupee} />
        <BookstoreStatCard label="Total Orders" value={stats?.totalOrders} icon={ShoppingCart} accent="from-[#55ace7] to-[#246392]" />
        <BookstoreStatCard label="Total Products" value={stats?.totalProducts} icon={Package} accent="from-[#2d9d78] to-[#1a6b52]" />
        <BookstoreStatCard label="Total Combos" value={stats?.totalCombos} icon={Layers} accent="from-[#e67e22] to-[#c0392b]" />
        <BookstoreStatCard label="Pending Orders" value={stats?.pendingOrders} icon={Clock} />
        <BookstoreStatCard label="Delivered Orders" value={stats?.deliveredOrders} icon={Truck} accent="from-[#2d9d78] to-[#1a6b52]" />
        <BookstoreStatCard label="Low Stock Products" value={stats?.lowStockProducts} icon={AlertTriangle} accent="from-[#e74c3c] to-[#c0392b]" />
        <BookstoreStatCard label="Top Sellers" value={stats?.topSellingProducts} icon={TrendingUp} accent="from-[#55ace7] to-[#246392]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-sm font-bold text-[#111]">Revenue analytics</h3>
          <BookstoreBarChart data={data?.revenueChart || []} valueKey="amount" labelKey="label" maxValue={revenueMax} formatValue={formatINR} />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-sm font-bold text-[#111]">Product sales</h3>
          <BookstoreBarChart data={data?.productSalesChart || []} valueKey="units" labelKey="label" />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-sm font-bold text-[#111]">Order trends</h3>
          <BookstoreBarChart data={data?.orderTrends || []} valueKey="orders" labelKey="label" />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-sm font-bold text-[#111]">Combo performance</h3>
          <BookstoreBarChart data={data?.comboPerformance || []} valueKey="sales" labelKey="label" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#111]">Recent Orders</h3>
        <PaginatedFigmaTable columns={orderColumns} data={data?.recentOrders || []} itemLabel="orders" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-bold text-[#111]">Low Stock Alerts</h3>
          <PaginatedFigmaTable columns={lowStockColumns} data={data?.lowStockAlerts || []} itemLabel="products" initialPageSize={5} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-[#111]">Best Sellers</h3>
          <PaginatedFigmaTable columns={bestSellerColumns} data={data?.bestSellers || []} itemLabel="products" initialPageSize={5} />
        </div>
      </div>
    </BookstorePageShell>
  )
}
