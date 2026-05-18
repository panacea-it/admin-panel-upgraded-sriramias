import { useMemo, useState } from 'react'
import { Edit3, Layers, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import BlogFilterToolbar from '../../components/blogs/BlogFilterToolbar'
import AddBlogModal from '../../components/blogs/AddBlogModal'
import { BannerButton, StatusBadge } from '../../components/academics/AcademicsUi'
import {
  formatBlogDate,
  formatBlogTime,
  isBlogToday,
  loadBlogs,
  saveBlogs,
} from '../../data/blogsData'

function BlogTitleCell({ title }) {
  return (
    <div className="flex max-w-md items-center gap-4 sm:gap-5">
      <span className="h-10 w-10 shrink-0 rounded bg-[#cbeeff]" aria-hidden />
      <span className="font-medium leading-snug">{title}</span>
    </div>
  )
}

function isThisWeek(iso) {
  const d = new Date(iso)
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return d >= start && d < end
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState(loadBlogs)
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('today')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)

  const persist = (next) => {
    setBlogs(next)
    saveBlogs(next)
  }

  const openCreate = () => {
    setEditingBlog(null)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingBlog(row)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingBlog(null)
  }

  const handleSave = (payload, { isEdit }) => {
    if (isEdit) {
      persist(blogs.map((b) => (b.id === payload.id ? payload : b)))
    } else {
      persist([...blogs, payload])
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return blogs.filter((row) => {
      const matchSearch = !q || row.title.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      let matchDate = true
      if (dateRange === 'today') matchDate = isBlogToday(row.publishedAt)
      if (dateRange === 'week') matchDate = isThisWeek(row.publishedAt)
      return matchSearch && matchStatus && matchDate
    })
  }, [blogs, search, dateRange, statusFilter])

  const handleDelete = (id) => {
    const next = blogs.filter((b) => b.id !== id)
    persist(next)
    toast.success('Blog deleted')
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      headerClassName: 'pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10 align-middle',
      render: (row) => <BlogTitleCell title={row.title} />,
    },
    {
      key: 'date',
      label: 'Date',
      cellClassName: 'align-middle whitespace-nowrap',
      render: (row) => formatBlogDate(row.publishedAt),
    },
    {
      key: 'time',
      label: 'Time',
      cellClassName: 'align-middle whitespace-nowrap',
      render: (row) => formatBlogTime(row.publishedAt),
    },
    {
      key: 'status',
      label: 'Status',
      cellClassName: 'align-middle',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      cellClassName: 'align-middle',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#686868] transition hover:text-[#246392] sm:text-base"
          >
            <Edit3 className="h-4 w-4" strokeWidth={2.35} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#c96565] transition hover:text-[#b94b4b] sm:text-base"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.1} />
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <PageBanner
          icon={Layers}
          iconClassName="text-[#246392]"
          title="Blogs"
          className="from-[#55ace7] via-[#8b98bb] to-[#df8284]"
        >
          <BannerButton onClick={openCreate}>Add Blog</BannerButton>
        </PageBanner>

        <BlogFilterToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          dateRange={dateRange}
          onDateRangeChange={(e) => setDateRange(e.target.value)}
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
        />

        <PaginatedFigmaTable
          columns={columns}
          data={filtered}
          emptyMessage="No blogs match your filters."
          itemLabel="blogs"
          resetDeps={[search, dateRange, statusFilter]}
          rowClassName="hover:bg-slate-50/90"
        />
      </section>

      <AddBlogModal
        open={modalOpen}
        onClose={closeModal}
        blog={editingBlog}
        onSave={handleSave}
      />
    </div>
  )
}
