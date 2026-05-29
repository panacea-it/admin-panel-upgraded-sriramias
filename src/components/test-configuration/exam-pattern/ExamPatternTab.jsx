import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, ClipboardList } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../figma/PageBanner'
import PaginatedFigmaTable from '../../figma/PaginatedFigmaTable'
import { BannerButton, StatusBadge } from '../../academics/AcademicsUi'
import TableActionMenu from '../../common/TableActionMenu'
import ConfirmDeleteDialog from '../../subjects/ConfirmDeleteDialog'
import { useEditModal } from '../../../hooks/useEditModal'
import { deleteExamPattern, fetchExamPatterns, upsertExamPattern } from '../../../api/testConfigurationAPI'
import ConfigFilterToolbar, { FilterSelect } from '../ConfigFilterToolbar'
import ExamPatternFormModal from './ExamPatternFormModal'
import ExamPatternViewModal from './ExamPatternViewModal'

const SORT_OPTIONS = [
  { value: 'createdOn:desc', label: 'Created On (Newest)' },
  { value: 'createdOn:asc', label: 'Created On (Oldest)' },
  { value: 'modifiedOn:desc', label: 'Modified On (Newest)' },
  { value: 'modifiedOn:asc', label: 'Modified On (Oldest)' },
]

function parseSort(value) {
  const [sortBy, sortDir] = String(value || 'createdOn:desc').split(':')
  return { sortBy, sortDir }
}

function displayDate(row, key) {
  return row?.[key] || row?.createdAt || '—'
}

export default function ExamPatternTab() {
  const modal = useEditModal()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('createdOn:desc')
  const [viewRow, setViewRow] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteRow, setDeleteRow] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { sortBy, sortDir } = parseSort(sort)

  const reload = async () => {
    setLoading(true)
    try {
      const list = await fetchExamPatterns({ search, status, sortBy, sortDir })
      setRows(list || [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load instructions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, sort])

  const handleSave = async (form, meta) => {
    const saved = await upsertExamPattern(form, meta)
    setRows((prev) => {
      if (meta.isEdit) {
        return prev.map((r) => (String(r.id) === String(meta.id) ? { ...r, ...saved } : r))
      }
      return [saved, ...prev]
    })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    setDeleting(true)
    try {
      await deleteExamPattern(deleteRow.id)
      setRows((prev) => prev.filter((r) => String(r.id) !== String(deleteRow.id)))
      toast.success('Instruction deleted')
      setDeleteOpen(false)
      setDeleteRow(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'Instruction ID',
      headerClassName: 'pl-6 sm:pl-10',
      cellClassName: 'pl-6 sm:pl-10',
    },
    {
      key: 'instructionDescription',
      label: 'Instruction Description',
      render: (r) => (
        <span className="line-clamp-2 max-w-md font-medium text-[#1a3a5c]">
          {r.instructionDescription || r.instructions || '—'}
        </span>
      ),
    },
    {
      key: 'createdOn',
      label: 'Created On',
      render: (r) => displayDate(r, 'createdOn'),
    },
    {
      key: 'modifiedOn',
      label: 'Modified On',
      render: (r) => displayDate(r, 'modifiedOn'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <TableActionMenu
          triggerLabel="Instruction actions"
          items={[
            { label: 'View', icon: Eye, onClick: () => setViewRow(row) },
            { label: 'Edit', icon: Pencil, onClick: () => modal.openEdit(row) },
            {
              label: 'Delete',
              icon: Trash2,
              danger: true,
              onClick: () => {
                setDeleteRow(row)
                setDeleteOpen(true)
              },
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageBanner
        icon={ClipboardList}
        title="Exam Pattern"
        className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
      >
        <BannerButton onClick={modal.openCreate}>Add Instruction</BannerButton>
      </PageBanner>

      <ConfigFilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search instructions…"
        status={status}
        onStatusChange={setStatus}
        extraFilters={
          <FilterSelect
            value={sort}
            onChange={setSort}
            label="Sort By"
            includeAll={false}
            options={SORT_OPTIONS.map((o) => o.value)}
            optionLabels={Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, o.label]))}
          />
        }
      />

      <PaginatedFigmaTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="No instructions found."
        itemLabel="instructions"
        resetDeps={[search, status, sort]}
        rowClassName="hover:bg-slate-50/90"
        stickyHeader
        stickyLastColumn
        zebraStriping
      />

      <ExamPatternFormModal
        open={modal.isOpen}
        onClose={modal.close}
        item={modal.selectedItem}
        onSubmit={handleSave}
      />

      <ExamPatternViewModal open={Boolean(viewRow)} onClose={() => setViewRow(null)} row={viewRow} />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete instruction?"
        message="Are you sure you want to delete this instruction?"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteOpen(false)
          setDeleteRow(null)
        }}
        loading={deleting}
      />
    </div>
  )
}
