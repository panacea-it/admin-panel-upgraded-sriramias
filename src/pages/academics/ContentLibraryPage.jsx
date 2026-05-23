import { useMemo, useState } from 'react'
import { Layers, Trash2 } from 'lucide-react'
import EditButton from '../../components/common/EditButton'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import CourseFilterToolbar from '../../components/courses/CourseFilterToolbar'
import AddFreeResourceModal from '../../components/content-library/AddFreeResourceModal'
import ModifyFreeResourceCategoryModal from '../../components/content-library/ModifyFreeResourceCategoryModal'
import { BannerButton, ResourceNameCell, StatusBadge } from '../../components/academics/AcademicsUi'
import {
  FREE_RESOURCE_CATEGORIES,
  INITIAL_FREE_RESOURCES,
} from '../../data/freeResourcesData'
import { useEditModal } from '../../hooks/useEditModal'
import { freeResourceFormToRow } from '../../utils/academicsFormMappers'
import { upsertListItem } from '../../utils/academicsCrud'

export default function ContentLibraryPage() {
  const [resources, setResources] = useState(INITIAL_FREE_RESOURCES)
  const [categories, setCategories] = useState(FREE_RESOURCE_CATEGORIES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const modal = useEditModal()
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
    return resources.filter((row) => {
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      const matchCategory = categoryFilter === 'all' || row.category === categoryFilter
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchCategory && matchStatus
    })
  }, [resources, search, categoryFilter, statusFilter])

  const handleSaveResource = (form, { isEdit, id }) => {
    const existing = isEdit ? resources.find((r) => r.id === id) : null
    const row = freeResourceFormToRow(form, existing)
    setResources((prev) => upsertListItem(prev, row, { isEdit, id }))
  }

  const handleAddCategory = ({ name }) => {
    setCategories((prev) => [...prev, { id: Date.now(), name, status: 'Active' }])
  }

  const handleDeleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    if (cat) {
      setResources((prev) =>
        prev.map((r) =>
          r.category === cat.name ? { ...r, category: 'Uncategorized' } : r,
        ),
      )
    }
  }

  const handleDeleteResource = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id))
    toast.success('Resource deleted')
  }

  const columns = [
    {
      key: 'name',
      label: 'Resource Name',
      headerClassName: 'pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10',
      render: (row) => <ResourceNameCell name={row.name} />,
    },
    { key: 'category', label: 'Resource Category' },
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
          <EditButton onClick={() => modal.openEdit(row)} />
          <button
            type="button"
            onClick={() => handleDeleteResource(row.id)}
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
          title="Free Resources"
          className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
        >
          <BannerButton onClick={modal.openCreate}>Add Free Resource</BannerButton>
          <BannerButton onClick={() => setCategoryOpen(true)}>Modify Category</BannerButton>
        </PageBanner>

        <CourseFilterToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search Free Resources"
          category={categoryFilter}
          onCategoryChange={(e) => setCategoryFilter(e.target.value)}
          status={statusFilter}
          onStatusChange={(e) => setStatusFilter(e.target.value)}
          categoryOptions={categoryOptions}
        />

        <PaginatedFigmaTable
          columns={columns}
          data={filtered}
          emptyMessage="No free resources match your filters."
          itemLabel="resources"
          resetDeps={[search, categoryFilter, statusFilter]}
          rowClassName="hover:bg-slate-50/90"
        />
      </section>

      <AddFreeResourceModal
        open={modal.isOpen}
        onClose={modal.close}
        item={modal.selectedItem}
        categories={categories}
        onSubmit={handleSaveResource}
      />

      <ModifyFreeResourceCategoryModal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  )
}
