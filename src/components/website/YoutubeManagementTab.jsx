import { useMemo, useState } from 'react'
import { PlusCircle } from 'lucide-react'
import PaginatedFigmaTable from '../figma/PaginatedFigmaTable'
import WebsiteFilterToolbar from './WebsiteFilterToolbar'
import WebsiteFormShell from './WebsiteFormShell'
import WebsiteFormModal from './WebsiteFormModal'
import YoutubeIcon from './YoutubeIcon'
import {
  DateTimeInline,
  TableRowActions,
  WebsiteField,
  WebsiteUrlInput,
  YoutubeUrlLink,
  websiteInputClass,
} from './websiteUi'
import { INITIAL_YOUTUBE_VIDEOS } from '../../data/websiteData'
import { toast } from '@/utils/toast'
import { cn } from '../../utils/cn'

const emptyYoutubeForm = () => ({
  id: String(56565 + Math.floor(Math.random() * 1000)),
  name: '',
  url: '',
})

export default function YoutubeManagementTab() {
  const [videos, setVideos] = useState(INITIAL_YOUTUBE_VIDEOS)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyYoutubeForm)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return videos.filter((row) => {
      const matchSearch =
        !q ||
        row.id.includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.url.toLowerCase().includes(q)
      const matchDate = dateFilter === 'all' || row.dateBucket === dateFilter
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchDate && matchStatus
    })
  }, [videos, search, dateFilter, statusFilter])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyYoutubeForm())
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setForm({ id: row.id, name: row.name, url: row.url })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const handleDelete = (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id))
    toast.success('Video deleted')
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('Please fill required fields')
      return
    }
    const payload = {
      id: form.id,
      name: form.name.trim(),
      url: form.url.trim(),
      time: '10 AM',
      date: '14 May 2026',
      dateBucket: 'Today',
      status: 'Active',
    }
    if (editingId) {
      setVideos((prev) =>
        prev.map((v) => (v.id === editingId ? { ...v, ...payload } : v)),
      )
      toast.success('Video updated successfully')
    } else {
      setVideos((prev) => [payload, ...prev])
      toast.success('Video added successfully')
    }
    closeForm()
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      headerClassName: 'w-[90px]',
      cellClassName: 'w-[90px] font-medium text-[#111]',
    },
    {
      key: 'name',
      label: 'Name',
      cellClassName: 'min-w-[180px] max-w-[240px] font-medium',
    },
    {
      key: 'url',
      label: 'URL',
      cellClassName: 'min-w-[200px] max-w-[260px]',
      render: (row) => <YoutubeUrlLink url={row.url} />,
    },
    {
      key: 'created',
      label: 'Created On',
      cellClassName: 'whitespace-nowrap',
      render: (row) => <DateTimeInline time={row.time} date={row.date} />,
    },
    {
      key: 'actions',
      label: 'Action',
      cellClassName: 'w-[160px]',
      render: (row) => (
        <TableRowActions
          compact
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Figma banner */}
      <div
        className={cn(
          'flex min-h-[64px] flex-wrap items-center justify-between gap-4 rounded-xl px-5 py-4',
          'bg-gradient-to-r from-[#55ace7] via-[#8b98bb] to-[#df8284]',
          'shadow-[0_5px_16px_rgba(15,23,42,0.1)]',
        )}
      >
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <YoutubeIcon className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold leading-none text-white">Youtube</h1>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1a3a5c] px-4 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition hover:bg-[#152f4a] active:scale-[0.98] sm:text-base"
        >
          <PlusCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          Add Video
        </button>
      </div>

      <WebsiteFilterToolbar
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        searchPlaceholder="Search youtube video"
        dateRange={dateFilter}
        onDateRangeChange={(e) => setDateFilter(e.target.value)}
        statusFilter={statusFilter}
        onStatusFilterChange={(e) => setStatusFilter(e.target.value)}
        showStatusFilter
      />

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        emptyMessage="No youtube videos found."
        itemLabel="videos"
        initialPageSize={6}
        resetDeps={[search, dateFilter, statusFilter]}
        density="compact"
        className="rounded-xl shadow-[0_11px_25px_rgba(15,23,42,0.07)]"
      />

      <WebsiteFormModal open={formOpen} onClose={closeForm}>
        <WebsiteFormShell
          iconNode={<YoutubeIcon className="h-5 w-5" />}
          title="Youtube Video"
          sectionTitle="Video Details"
          onGoBack={closeForm}
          onReset={() => setForm(emptyYoutubeForm())}
          onSave={handleSave}
        >
          <div className="grid gap-6 sm:grid-cols-3">
            <WebsiteField label="ID">
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                className={websiteInputClass}
              />
            </WebsiteField>
            <WebsiteField label="Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={websiteInputClass}
              />
            </WebsiteField>
            <WebsiteField label="Youtube URL" required>
              <WebsiteUrlInput
                id="youtube-url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </WebsiteField>
          </div>
        </WebsiteFormShell>
      </WebsiteFormModal>
    </div>
  )
}
