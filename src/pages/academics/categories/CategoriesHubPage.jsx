import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PlusCircle } from 'lucide-react'
import PageBanner from '../../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../../components/figma/PaginatedFigmaTable'
import CategorySectionTabs from '../../../components/categories/CategorySectionTabs'
import CategoryFilterBar from '../../../components/categories/CategoryFilterBar'
import CategoryStatusBadge from '../../../components/categories/CategoryStatusBadge'
import CategoryTableActions from '../../../components/categories/CategoryTableActions'
import CategoryEmptyState from '../../../components/categories/CategoryEmptyState'
import CategoryHubFormModal from '../../../components/categories/CategoryHubFormModal'
import ViewMainCategoryModal from '../../../components/categories/ViewMainCategoryModal'
import {
  CATEGORIES_HUB_INITIAL,
  PARENT_CATEGORY_OPTIONS,
  SUBJECT_OPTIONS,
} from '../../../data/categoriesHubData'
import {
  CATEGORY_HUB_SECTIONS,
  CATEGORY_HUB_TABS,
} from '../../../constants/categoryHubSections'
import { useEditModal } from '../../../hooks/useEditModal'
import { formatCategoryDateTime } from '../../../utils/formatDateTime'
import { toast } from '../../../utils/toast'

const DEFAULT_TAB = 'exam-category'

function nextId(list) {
  const max = list.reduce((m, row) => Math.max(m, parseInt(row.id, 10) || 0), 0)
  return String(max + 1).padStart(3, '0')
}

function emptyFilters() {
  return { search: '', status: 'all', category: 'all', subject: 'all' }
}

function CategoryIcon({ row }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#cbeeff] text-xs font-bold text-[#246392]">
      {row.iconUrl ? (
        <img src={row.iconUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        row.iconLabel || row.name?.slice(0, 2)?.toUpperCase()
      )}
    </div>
  )
}

function AddButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 min-h-[38px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1a3a5c] to-[#03045e] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(3,4,94,0.35)] transition hover:scale-[1.02] hover:shadow-[0_6px_18px_rgba(3,4,94,0.4)] active:scale-[0.98] sm:text-base"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
        <PlusCircle className="h-4 w-4" strokeWidth={2.2} />
      </span>
      {children}
    </button>
  )
}

export default function CategoriesHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = CATEGORY_HUB_TABS.some((t) => t.id === tabParam)
    ? tabParam
    : DEFAULT_TAB

  const section = CATEGORY_HUB_SECTIONS[activeTab]
  const Icon = section.icon

  const [dataBySection, setDataBySection] = useState(CATEGORIES_HUB_INITIAL)
  const [filtersBySection, setFiltersBySection] = useState(() =>
    Object.fromEntries(CATEGORY_HUB_TABS.map((t) => [t.id, emptyFilters()])),
  )

  const modal = useEditModal()
  const [viewItem, setViewItem] = useState(null)

  const rows = dataBySection[activeTab] || []
  const filters = filtersBySection[activeTab] || emptyFilters()

  const setActiveTab = useCallback(
    (tabId) => {
      setSearchParams({ tab: tabId }, { replace: true })
      modal.close()
      setViewItem(null)
    },
    [setSearchParams, modal],
  )

  const updateFilters = (patch) => {
    setFiltersBySection((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], ...patch },
    }))
  }

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim()
    return rows.filter((row) => {
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.description?.toLowerCase().includes(q) ||
        row.parentCategory?.toLowerCase().includes(q) ||
        row.subject?.toLowerCase().includes(q)
      const matchStatus =
        filters.status === 'all' || row.status === filters.status
      const matchCategory =
        filters.category === 'all' || row.parentCategory === filters.category
      const matchSubject =
        filters.subject === 'all' || row.subject === filters.subject
      return matchSearch && matchStatus && matchCategory && matchSubject
    })
  }, [rows, filters])

  const handleSave = (form, { isEdit, id }) => {
    const now = new Date().toISOString()
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      status: form.status,
      parentCategory: form.parentCategory || '',
      subject: form.subject || '',
      iconUrl: form.iconUrl || '',
      iconFileName: form.iconFileName || '',
      iconLabel: form.iconLabel || form.name.slice(0, 2).toUpperCase(),
      modifiedAt: now,
    }

    setDataBySection((prev) => {
      const list = prev[activeTab] || []
      if (isEdit && id != null) {
        return {
          ...prev,
          [activeTab]: list.map((row) =>
            row.id === id ? { ...row, ...payload } : row,
          ),
        }
      }
      return {
        ...prev,
        [activeTab]: [
          ...list,
          { id: nextId(list), ...payload, createdAt: now },
        ],
      }
    })
  }

  const handleDelete = (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return
    setDataBySection((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((c) => c.id !== row.id),
    }))
    toast.success('Deleted successfully')
  }

  const handleToggleStatus = (row) => {
    const next = row.status === 'Active' ? 'In Active' : 'Active'
    setDataBySection((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((c) =>
        c.id === row.id
          ? { ...c, status: next, modifiedAt: new Date().toISOString() }
          : c,
      ),
    }))
    toast.success(next === 'Active' ? 'Enabled' : 'Disabled')
  }

  const createdLabel = section.dateColumns?.created || 'Created On'
  const modifiedLabel = section.dateColumns?.modified || 'Modified On'

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'id',
        label: 'ID',
        headerClassName: 'pl-6 sm:pl-8',
        cellClassName: 'pl-6 sm:pl-8',
        render: (row) => (
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 shrink-0 rounded bg-[#d1e9f6]" aria-hidden />
            <span className="font-medium tabular-nums">{row.id}</span>
          </div>
        ),
      },
      {
        key: 'name',
        label: section.primaryColumn,
        render: (row) => (
          <div className="flex items-center gap-3">
            {section.formFields.includes('icon') && <CategoryIcon row={row} />}
            <span className="font-medium">{row.name}</span>
          </div>
        ),
      },
    ]

    if (activeTab === 'exam-sub-category') {
      cols.push({
        key: 'parentCategory',
        label: 'Category',
        render: (row) => <span>{row.parentCategory}</span>,
      })
    }

    if (activeTab === 'topic' || activeTab === 'teachers') {
      cols.push({
        key: 'subject',
        label: 'Subject',
        render: (row) => <span>{row.subject}</span>,
      })
    }

    cols.push(
      {
        key: 'createdAt',
        label: createdLabel,
        render: (row) => (
          <span className="whitespace-nowrap">{formatCategoryDateTime(row.createdAt)}</span>
        ),
      },
      {
        key: 'modifiedAt',
        label: modifiedLabel,
        render: (row) => (
          <span className="whitespace-nowrap">{formatCategoryDateTime(row.modifiedAt)}</span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <CategoryStatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        label: 'Action',
        render: (row) => (
          <CategoryTableActions
            status={row.status}
            onView={() => setViewItem(row)}
            onEdit={() => modal.openEdit(row)}
            onDelete={() => handleDelete(row)}
            onToggleStatus={() => handleToggleStatus(row)}
          />
        ),
      },
    )

    return cols
  }, [activeTab, section, modal])

  const categoryFilterOptions = [
    { value: 'all', label: 'Category' },
    ...PARENT_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
  ]

  const subjectFilterOptions = [
    { value: 'all', label: 'Subject' },
    ...SUBJECT_OPTIONS.map((s) => ({ value: s, label: s })),
  ]

  const showEmpty = rows.length === 0
  const showNoResults = !showEmpty && filtered.length === 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="figma-admin-section min-h-full bg-[#f7f7f7] px-4 pb-8 pt-6 sm:px-5 lg:px-6"
    >
      <section className="mx-auto max-w-screen-2xl space-y-5 sm:space-y-6">
        <CategorySectionTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="space-y-5 sm:space-y-6"
          >
            <PageBanner
              icon={Icon}
              iconClassName="text-[#246392]"
              title={section.bannerTitle}
              className="from-[#55ace7] via-[#8b98bb] to-[#df8284]"
            >
              <AddButton onClick={modal.openCreate}>{section.addLabel}</AddButton>
            </PageBanner>

            <CategoryFilterBar
              search={filters.search}
              onSearchChange={(e) => updateFilters({ search: e.target.value })}
              searchPlaceholder={section.searchPlaceholder}
              status={filters.status}
              onStatusChange={(e) => updateFilters({ status: e.target.value })}
              categoryFilter={filters.category}
              onCategoryFilterChange={(e) =>
                updateFilters({ category: e.target.value })
              }
              categoryOptions={
                section.filters.includes('category') ? categoryFilterOptions : undefined
              }
              subjectFilter={filters.subject}
              onSubjectFilterChange={(e) =>
                updateFilters({ subject: e.target.value })
              }
              subjectOptions={
                section.filters.includes('subject') ? subjectFilterOptions : undefined
              }
            />

            {showEmpty ? (
              <CategoryEmptyState
                title={section.emptyTitle}
                description={section.emptyDescription}
                ctaLabel={section.emptyCta}
                onCta={modal.openCreate}
              />
            ) : showNoResults ? (
              <CategoryEmptyState
                title="No matching records"
                description="Try adjusting your search or filters."
                ctaLabel="Clear filters"
                onCta={() => updateFilters(emptyFilters())}
              />
            ) : (
              <PaginatedFigmaTable
                columns={columns}
                data={filtered}
                emptyMessage="No records found."
                itemLabel={section.bannerTitle.toLowerCase()}
                resetDeps={[filters, activeTab]}
                rowClassName="transition-colors hover:bg-slate-50/90"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <CategoryHubFormModal
        open={modal.isOpen}
        onClose={modal.close}
        item={modal.selectedItem}
        section={section}
        onSubmit={handleSave}
      />

      <ViewMainCategoryModal
        open={Boolean(viewItem)}
        onClose={() => setViewItem(null)}
        item={viewItem}
      />
    </motion.div>
  )
}
