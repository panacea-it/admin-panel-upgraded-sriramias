import PaginatedFigmaTable from '../figma/PaginatedFigmaTable'
import StatusBadge from './StatusBadge'
import { SubjectRowActions } from './ActionButtons'

function IdCell({ id }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-6 w-6 shrink-0 rounded bg-[#cbeeff]" aria-hidden />
      <span className="font-mono text-sm font-semibold text-[#111]">{id}</span>
    </div>
  )
}

export default function SubjectTable({
  data,
  onAddRow,
  onViewList,
  onEdit,
  onDelete,
  search,
  statusFilter,
  emptyMessage = 'No subjects found.',
}) {
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => <IdCell id={row.id} />,
    },
    {
      key: 'subjectName',
      label: 'Subject',
      render: (row) => (
        <span className="font-semibold text-[#111]">{row.subjectName}</span>
      ),
    },
    {
      key: 'topic',
      label: 'Topic',
      render: (row) => <span className="text-sm text-[#444]">{row.topic || '—'}</span>,
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (row) => <span className="text-sm text-[#444]">{row.teacher || '—'}</span>,
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
        <SubjectRowActions
          onAdd={() => onAddRow(row)}
          onViewList={() => onViewList(row)}
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
      itemLabel="subjects"
      resetDeps={[search, statusFilter]}
      rowClassName="transition-colors hover:bg-[#f8fbff]"
    />
  )
}
