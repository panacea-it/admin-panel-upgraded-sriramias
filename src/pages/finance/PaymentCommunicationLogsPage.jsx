import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchCommunicationLogs, sendPaymentReminder } from '../../api/financeAPI'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import FinanceExportToolbar from '../../components/finance/FinanceExportToolbar'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

export default function PaymentCommunicationLogsPage() {
  const { canExport } = useFinancePermissions()
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [channelFilter, setChannelFilter] = useState('all')
  const [reminderForm, setReminderForm] = useState({ mobile: '', email: '', channel: 'WhatsApp' })

  const load = useCallback(async () => {
    try {
      setLogs(await fetchCommunicationLogs())
    } catch {
      toast.error('Failed to load communication logs')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return logs.filter((row) => {
      if (channelFilter !== 'all' && row.channel !== channelFilter) return false
      if (!q) return true
      return `${row.recipient} ${row.type} ${row.id}`.toLowerCase().includes(q)
    })
  }, [logs, debouncedSearch, channelFilter])

  const handleSendReminder = async (e) => {
    e.preventDefault()
    try {
      await sendPaymentReminder(reminderForm)
      toast.success('Reminder queued')
      setReminderForm({ mobile: '', email: '', channel: 'WhatsApp' })
      load()
    } catch {
      toast.error('Failed to send reminder')
    }
  }

  const columns = [
    { key: 'id', label: 'Log ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'type', label: 'Type' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'channel', label: 'Channel' },
    { key: 'status', label: 'Status', render: (r) => <FinanceStatusBadge status={r.status} /> },
    { key: 'timestamp', label: 'Sent', render: (r) => formatCategoryDateTime(r.timestamp) },
  ]

  return (
    <FinancePageShell
      icon={MessageSquare}
      title="Payment Communication Logs"
      actions={
        <FinanceExportToolbar
          rows={filtered}
          filenameBase="communication-logs"
          title="Communication Logs"
          canExport={canExport}
          variant="banner"
        />
      }
    >
      <form onSubmit={handleSendReminder} className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <h3 className="mb-3 text-sm font-bold text-[#246392]">Send payment reminder</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            placeholder="Mobile"
            value={reminderForm.mobile}
            onChange={(e) => setReminderForm((f) => ({ ...f, mobile: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={reminderForm.email}
            onChange={(e) => setReminderForm((f) => ({ ...f, email: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            value={reminderForm.channel}
            onChange={(e) => setReminderForm((f) => ({ ...f, channel: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#246392] px-4 py-2 text-sm font-semibold text-white"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search logs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All channels</option>
          <option value="Email">Email</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
      </div>

      <PaginatedFigmaTable
        columns={columns}
        data={filtered}
        itemLabel="logs"
        resetDeps={[debouncedSearch, channelFilter]}
      />
    </FinancePageShell>
  )
}
