import { useEffect, useMemo, useState } from 'react'
import { Settings2, Copy, Tags, Trash2, Pencil } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { BannerButton, StatusBadge } from '../../components/academics/AcademicsUi'
import TableActionMenu from '../../components/common/TableActionMenu'
import { useEditModal } from '../../hooks/useEditModal'
import TestConfigFormModal from '../../components/test-management/TestConfigFormModal'
import QuestionTaggingModal from '../../components/test-management/QuestionTaggingModal'
import {
  deleteTestConfig,
  fetchTestConfigs,
  upsertTestConfig,
} from '../../api/testManagementAPI'

export default function TestConfigurationPage() {
  const modal = useEditModal()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [subject, setSubject] = useState('all')

  const [taggingOpen, setTaggingOpen] = useState(false)
  const [taggingConfig, setTaggingConfig] = useState(null)

  const reload = async () => {
    setLoading(true)
    try {
      const list = await fetchTestConfigs({ search, status, subject })
      setRows(list || [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load configurations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, subject])

  const subjects = useMemo(() => Array.from(new Set(rows.map((r) => r.subject).filter(Boolean))).sort(), [rows])

  const handleSave = async (form, { isEdit, id }) => {
    const payload = { ...form }
    const saved = await upsertTestConfig(payload, { isEdit, id })
    setRows((prev) => {
      const next = [...prev]
      if (isEdit) {
        const idx = next.findIndex((r) => String(r.id) === String(id))
        if (idx >= 0) next[idx] = { ...next[idx], ...saved }
        return next
      }
      return [saved, ...next]
    })
  }

  const handleDelete = async (id) => {
    await deleteTestConfig(id)
    setRows((prev) => prev.filter((r) => String(r.id) !== String(id)))
    toast.success('Configuration deleted')
  }

  const openTagging = (row) => {
    setTaggingConfig(row)
    setTaggingOpen(true)
  }

  const saveTags = async (taggedIds) => {
    const row = taggingConfig
    if (!row) return
    const saved = await upsertTestConfig(
      { ...row, taggedQuestionIds: taggedIds, totalQuestions: taggedIds.length },
      { isEdit: true, id: row.id },
    )
    setRows((prev) => prev.map((r) => (String(r.id) === String(row.id) ? { ...r, ...saved } : r)))
  }

  const columns = [
    { key: 'id', label: 'Config ID', headerClassName: 'pl-6 sm:pl-10', cellClassName: 'pl-6 sm:pl-10' },
    { key: 'testName', label: 'Test Name', render: (r) => <span className="font-medium">{r.testName}</span> },
    { key: 'subject', label: 'Subject' },
    { key: 'totalQuestions', label: 'Total Questions' },
    { key: 'totalMarks', label: 'Total Marks' },
    { key: 'difficultyMix', label: 'Difficulty Mix' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'updatedAt', label: 'Last Updated' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <TableActionMenu
          triggerLabel="Configuration actions"
          items={[
            { label: 'Tag Questions', icon: Tags, onClick: () => openTagging(row) },
            { label: 'Edit', icon: Pencil, onClick: () => modal.openEdit(row) },
            { label: 'Duplicate', icon: Copy, onClick: () => modal.openDuplicate(row) },
            { label: 'Delete', icon: Trash2, danger: true, onClick: () => handleDelete(row.id) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageBanner
        icon={Settings2}
        title="Test Configuration"
        className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
      >
        <BannerButton onClick={modal.openCreate}>Create Configuration</BannerButton>
      </PageBanner>

      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.08)] sm:px-4">
        <div className="relative w-full min-w-0 flex-1 sm:max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search configurations"
            className="h-10 w-full min-h-[38px] rounded-lg bg-[#eef2fc] px-4 text-sm text-[#222] outline-none placeholder:text-[#9ca0a8] focus:ring-2 focus:ring-[#55ace7] sm:text-base"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-10 min-h-[38px] w-full appearance-none rounded-lg border-0 bg-[#55ace7] px-4 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-[#246392]/50 sm:w-auto sm:min-w-[160px] sm:text-base"
          >
            <option value="all" className="bg-white text-[#222]">
              Subject
            </option>
            {subjects.map((s) => (
              <option key={s} value={s} className="bg-white text-[#222]">
                {s}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 min-h-[38px] w-full appearance-none rounded-lg border-0 bg-[#55ace7] px-4 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-[#246392]/50 sm:w-auto sm:min-w-[160px] sm:text-base"
          >
            <option value="all" className="bg-white text-[#222]">
              Status
            </option>
            <option value="Active" className="bg-white text-[#222]">
              Active
            </option>
            <option value="Draft" className="bg-white text-[#222]">
              Draft
            </option>
            <option value="In Active" className="bg-white text-[#222]">
              In Active
            </option>
          </select>
        </div>
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="No configurations found."
        itemLabel="configurations"
        resetDeps={[search, status, subject]}
        rowClassName="hover:bg-slate-50/90"
        stickyHeader
        stickyLastColumn
      />

      <TestConfigFormModal open={modal.isOpen} onClose={modal.close} item={modal.selectedItem} onSubmit={handleSave} />

      <QuestionTaggingModal
        open={taggingOpen}
        onClose={() => {
          setTaggingOpen(false)
          setTaggingConfig(null)
        }}
        config={taggingConfig}
        onSaveTags={saveTags}
      />
    </div>
  )
}

