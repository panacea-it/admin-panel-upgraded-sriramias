import PaginatedFigmaTable from '../figma/PaginatedFigmaTable'
import StatusBadge from './StatusBadge'
import { TopicRowActions } from './ActionButtons'
import { parseDateForDisplay } from '../../utils/academicsSubjectsStorage'

function IdCell({ id }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-6 w-6 shrink-0 rounded bg-[#cbeeff]" aria-hidden />
      <span className="font-mono text-sm font-semibold text-[#111]">{id}</span>
    </div>
  )
}

export default function TopicTable({
  data,
  onEdit,
  onDelete,
  search,
  statusFilter,
  categoryFilter,
  emptyMessage = 'No live classes found.',
}) {
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => <IdCell id={row.id} />,
    },
    {
      key: 'classTitle',
      label: 'Class Title',
      render: (row) => (
        <span className="font-semibold text-[#111]">{row.classTitle}</span>
      ),
    },
    {
      key: 'center',
      label: 'Center',
      render: (row) => <span className="text-sm text-[#444]">{row.center || '—'}</span>,
    },
    {
      key: 'classroom',
      label: 'Classroom',
      render: (row) => (
        <span className="text-sm text-[#444]">{row.classroom || '—'}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="whitespace-nowrap text-sm">{parseDateForDisplay(row.date)}</span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => (
        <span className="whitespace-nowrap text-sm text-[#444]">{row.duration || '—'}</span>
      ),
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
        <TopicRowActions
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ]

  return (
    <PaginatedFigmaTable
      columns={columns}
      data={data}
      emptyMessage={emptyMessage}
      itemLabel="classes"
      resetDeps={[search, statusFilter, categoryFilter]}
      rowClassName="transition-colors hover:bg-[#f8fbff]"
    />
  )
}
