import { useMemo, useState } from 'react'
import { Edit3, Image } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import BannerFilterToolbar from '../../components/banners/BannerFilterToolbar'
import { cn } from '../../utils/cn'
import { BANNER_CATEGORIES, INITIAL_BANNERS } from '../../data/bannersData'

function BannerStatusBadge({ status }) {
  const active = status === 'Active'
  return (
    <span
      className={cn(
        'inline-flex min-w-[88px] items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-white',
        active ? 'bg-[#69df66]' : 'bg-[#9ca3af]',
      )}
    >
      {status}
    </span>
  )
}

function BannerThumbnail({ hasThumbnail, course }) {
  if (!hasThumbnail) {
    return (
      <span
        className="inline-block h-10 w-16 shrink-0 rounded bg-[#e5e7eb]"
        aria-hidden
      />
    )
  }

  return (
    <img
      src={`https://picsum.photos/seed/${encodeURIComponent(course.slice(0, 24))}/64/40`}
      alt=""
      className="h-10 w-16 shrink-0 rounded object-cover"
    />
  )
}

export default function BannersPage() {
  const [banners] = useState(INITIAL_BANNERS)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [centerFilter, setCenterFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'Category' },
      ...BANNER_CATEGORIES.map((name) => ({ value: name, label: name })),
    ],
    [],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return banners.filter((row) => {
      const matchSearch =
        !q ||
        row.course.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        String(row.id).includes(q)
      const matchCategory = categoryFilter === 'all' || row.category === categoryFilter
      const matchCenter = centerFilter === 'all' || row.center === centerFilter
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchCategory && matchCenter && matchStatus
    })
  }, [banners, search, categoryFilter, centerFilter, statusFilter])

  const columns = [
    {
      key: 'id',
      label: 'ID',
      headerClassName: 'pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10 align-middle font-semibold',
    },
    {
      key: 'course',
      label: 'Course',
      cellClassName: 'align-middle max-w-xs',
      render: (row) => <span className="font-medium leading-snug">{row.course}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      cellClassName: 'align-middle whitespace-nowrap',
    },
    {
      key: 'banner',
      label: 'Banner',
      cellClassName: 'align-middle',
      render: (row) => (
        <div className="flex items-center gap-3">
          <BannerThumbnail hasThumbnail={row.hasThumbnail} course={row.course} />
          <button
            type="button"
            onClick={() => toast.message('Banner editor coming soon')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#686868] transition hover:text-[#246392]"
          >
            <Edit3 className="h-4 w-4" strokeWidth={2.35} />
            Edit
          </button>
        </div>
      ),
    },
    {
      key: 'center',
      label: 'Center',
      cellClassName: 'align-middle',
    },
    {
      key: 'status',
      label: 'Status',
      cellClassName: 'align-middle',
      render: (row) => <BannerStatusBadge status={row.status} />,
    },
  ]

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <PageBanner
          icon={Image}
          iconClassName="text-[#246392]"
          title="Banner"
          className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
        />

        <BannerFilterToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          category={categoryFilter}
          onCategoryChange={(e) => setCategoryFilter(e.target.value)}
          center={centerFilter}
          onCenterChange={(e) => setCenterFilter(e.target.value)}
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
          categoryOptions={categoryOptions}
        />

        <PaginatedFigmaTable
          columns={columns}
          data={filtered}
          emptyMessage="No banners match your filters."
          rowClassName="hover:bg-slate-50/90"
          itemLabel="banners"
          resetDeps={[search, categoryFilter, centerFilter, statusFilter]}
        />
      </section>
    </div>
  )
}
