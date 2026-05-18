import { useMemo, useState } from 'react'
import { BookMarked, Edit3, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import AddBookModal from '../../components/books/AddBookModal'
import AddMainBookModal from '../../components/books/AddMainBookModal'
import { BannerButton, ResourceNameCell, StatusBadge } from '../../components/academics/AcademicsUi'
import { INITIAL_BOOKS } from '../../data/booksData'

export default function BooksPage() {
  const [books, setBooks] = useState(INITIAL_BOOKS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addBookOpen, setAddBookOpen] = useState(false)
  const [mainBookOpen, setMainBookOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return books.filter((row) => {
      const matchSearch = !q || row.name.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [books, search, statusFilter])

  const handleAddBook = (form) => {
    const price =
      form.bookPrice?.trim() ||
      (form.discountPct ? `${form.bookPrice || '—'} (${form.discountPct}% off)` : '—')
    setBooks((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.bookName,
        price: form.bookPrice?.trim() ? `₹${form.bookPrice}` : price,
        status: 'Active',
      },
    ])
  }

  const handleDelete = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
    toast.success('Book deleted')
  }

  const columns = [
    {
      key: 'name',
      label: 'Book Name',
      headerClassName: 'pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10',
      render: (row) => <ResourceNameCell name={row.name} />,
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span className="whitespace-nowrap">{row.price}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
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
          icon={BookMarked}
          iconClassName="text-[#dc2626]"
          title="Book Manager"
          className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
        >
          <BannerButton onClick={() => setAddBookOpen(true)}>Add New Book</BannerButton>
          <BannerButton onClick={() => setMainBookOpen(true)}>Add Main Book</BannerButton>
        </PageBanner>

        <CourseFilterToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search Books"
          category=""
          onCategoryChange={() => {}}
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
        />

        <PaginatedFigmaTable
          columns={columns}
          data={filtered}
          emptyMessage="No books match your filters."
          itemLabel="books"
          resetDeps={[search, statusFilter]}
          rowClassName="hover:bg-slate-50/90"
        />
      </section>

      <AddBookModal
        open={addBookOpen}
        onClose={() => setAddBookOpen(false)}
        onSubmit={handleAddBook}
      />

      <AddMainBookModal
        open={mainBookOpen}
        onClose={() => setMainBookOpen(false)}
        onSubmit={() => toast.success('Main book promotion saved')}
      />
    </div>
  )
}
