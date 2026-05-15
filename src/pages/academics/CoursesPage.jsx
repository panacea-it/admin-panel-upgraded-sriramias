import { useMemo, useState } from 'react'
import { BookMarked, Edit3, PlusCircle } from 'lucide-react'
import PageBanner from '../../components/figma/PageBanner'
import FigmaTable from '../../components/figma/FigmaTable'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import AddCourseModal from '../../components/courses/AddCourseModal'
import ModifyCategoryModal from '../../components/courses/ModifyCategoryModal'
import { COURSE_CATEGORIES, INITIAL_COURSES } from '../../data/coursesData'
import { cn } from '../../utils/cn'

function BannerButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 min-h-[38px] items-center justify-center gap-2 rounded-lg bg-[#1a3a5c] px-4 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition hover:bg-[#152f4a] sm:text-base"
    >
      <PlusCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      {children}
    </button>
  )
}

function StatusBadge({ status }) {
  const active = status === 'Active'
  return (
    <span
      className={cn(
        'inline-flex min-w-[88px] items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-white',
        active ? 'bg-[#69df66]' : 'bg-[#efb36d]',
      )}
    >
      {status}
    </span>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState(INITIAL_COURSES)
  const [categories, setCategories] = useState(COURSE_CATEGORIES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'Category' },
      ...categories.map((c) => ({ value: c.name, label: c.name })),
    ],
    [categories],
  )

  const filtered = useMemo(() => {
    return courses.filter((row) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      const matchCategory =
        categoryFilter === 'all' || row.category === categoryFilter
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchCategory && matchStatus
    })
  }, [courses, search, categoryFilter, statusFilter])

  const handleAddCourse = (form) => {
    setCourses((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.courseName,
        category: form.category,
        center: 'Delhi',
        price: form.offlineFees || form.onlineFees || '—',
        status: 'Active',
      },
    ])
  }

  const handleAddCategory = (name) => {
    setCategories((prev) => [
      ...prev,
      { id: Date.now(), name, status: 'Active' },
    ])
  }

  const handleDeleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const columns = [
    {
      key: 'name',
      label: 'Course Name',
      headerClassName: 'pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10',
      render: (row) => (
        <div className="flex items-center gap-4 sm:gap-5">
          <span className="h-6 w-6 shrink-0 rounded bg-[#cbeeff]" />
          <span className="truncate font-medium">{row.name}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Course Category' },
    { key: 'center', label: 'Center' },
    { key: 'price', label: 'Price', render: (row) => <span className="whitespace-nowrap">{row.price}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: () => (
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#686868] transition hover:text-[#246392] sm:text-base"
        >
          <Edit3 className="h-4 w-4" strokeWidth={2.35} />
          Edit
        </button>
      ),
    },
  ]

  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6">
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <PageBanner
          icon={BookMarked}
          iconClassName="text-[#dc2626]"
          title="Course Manager"
          className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
        >
          <BannerButton onClick={() => setAddOpen(true)}>Add New Course</BannerButton>
          <BannerButton onClick={() => setCategoryOpen(true)}>Modify Category</BannerButton>
        </PageBanner>

        <CourseFilterToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          category={categoryFilter}
          onCategoryChange={(e) => setCategoryFilter(e.target.value)}
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
          categoryOptions={categoryOptions}
        />

        <FigmaTable columns={columns} data={filtered} emptyMessage="No courses found." />
      </section>

      <AddCourseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        categories={categories}
        onSubmit={handleAddCourse}
      />

      <ModifyCategoryModal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  )
}
