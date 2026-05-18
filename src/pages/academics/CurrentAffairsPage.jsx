import { useMemo, useState } from 'react'
import { Edit3, Layers, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import AddCurrentAffairsModal from '../../components/current-affairs/AddCurrentAffairsModal'
import ModifyCurrentAffairsCategoryModal from '../../components/current-affairs/ModifyCurrentAffairsCategoryModal'
import { BannerButton, ResourceNameCell, StatusBadge } from '../../components/academics/AcademicsUi'
import {
  CURRENT_AFFAIRS_CATEGORIES,
  INITIAL_CURRENT_AFFAIRS,
} from '../../data/currentAffairsData'

export default function CurrentAffairsPage() {
  const [items, setItems] = useState(INITIAL_CURRENT_AFFAIRS)
  const [categories, setCategories] = useState(CURRENT_AFFAIRS_CATEGORIES)
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
    const q = search.trim().toLowerCase()
    return items.filter((row) => {
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      const matchCategory = categoryFilter === 'all' || row.category === categoryFilter
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchCategory && matchStatus
    })
  }, [items, search, categoryFilter, statusFilter])

  const handleAdd = (form) => {
    const displayName =
      form.name.trim() ||
      `${form.month} ${form.year} - ${form.category}`
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: displayName,
        category: form.category,
        status: 'Active',
      },
    ])
  }

  const handleAddCategory = ({ name }) => {
    setCategories((prev) => [...prev, { id: Date.now(), name, status: 'Active' }])
  }

  const handleDeleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    if (cat) {
      setItems((prev) =>
        prev.map((r) =>
          r.category === cat.name ? { ...r, category: 'Uncategorized' } : r,
        ),
      )
    }
  }

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((r) => r.id !== id))
    toast.success('Current affairs entry deleted')
  }

  const columns = [
    {
      key: 'name',
      label: 'Current Affairs Name',
      headerClassName: 'pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10',
      render: (row) => <ResourceNameCell name={row.name} />,
    },
    { key: 'category', label: 'Current Affair Category' },
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
          icon={Layers}
          iconClassName="text-[#dc2626]"
          title="Current Affairs"
          className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
        >
          <BannerButton onClick={() => setAddOpen(true)}>Add Current Affairs</BannerButton>
          <BannerButton onClick={() => setCategoryOpen(true)}>Modify Category</BannerButton>
        </PageBanner>

        <CourseFilterToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search Current Affairs"
          category={categoryFilter}
          onCategoryChange={(e) => setCategoryFilter(e.target.value)}
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
          categoryOptions={categoryOptions}
        />

        <PaginatedFigmaTable
          columns={columns}
          data={filtered}
          emptyMessage="No current affairs match your filters."
          itemLabel="entries"
          resetDeps={[search, categoryFilter, statusFilter]}
          rowClassName="hover:bg-slate-50/90"
        />
      </section>

      <AddCurrentAffairsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        categories={categories}
        onSubmit={handleAdd}
      />

      <ModifyCurrentAffairsCategoryModal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  )
}
