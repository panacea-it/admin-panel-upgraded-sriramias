import PaginatedFigmaTable from '../figma/PaginatedFigmaTable'
import { facultySubjectLabels } from '../../data/facultySubjectLabels'
import StatusBadge from './StatusBadge'
import { SubjectRowActions } from './ActionButtons'
import TableValueChips from './TableValueChips'
import {
  deriveLiveStatus,
  deriveRecordingStatus,
  deriveTestSeriesStatus,
  normalizeCategories,
} from '../../utils/subjectCategoryHelpers'
import { normalizeTestSeriesBlock } from '../../utils/batchTestSeriesForm'
import { parseDateForDisplay } from '../../utils/academicsSubjectsStorage'

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
  emptyMessage = `No ${facultySubjectLabels.plural.toLowerCase()} found.`,
}) {
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => <IdCell id={row.id} />,
    },
    {
      key: 'subjectName',
      label: facultySubjectLabels.singular,
      render: (row) => (
        <span className="font-semibold text-[#111]">{row.subjectName}</span>
      ),
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (row) => <span className="text-sm text-[#444]">{row.teacher || '—'}</span>,
    },
    {
      key: 'categories',
      label: 'Categories',
      render: (row) => (
        <TableValueChips values={normalizeCategories(row.categories ?? row.category)} />
      ),
    },
    {
      key: 'liveStatus',
      label: 'Live Class Status',
      render: (row) => (
        <span className="text-sm text-[#444]">{deriveLiveStatus(row)}</span>
      ),
    },
    {
      key: 'recordingStatus',
      label: 'Recording Status',
      render: (row) => (
        <span className="text-sm text-[#444]">{deriveRecordingStatus(row)}</span>
      ),
    },
    {
      key: 'testSeriesStatus',
      label: 'Test Series Status',
      render: (row) => (
        <span className="text-sm text-[#444]">{deriveTestSeriesStatus(row)}</span>
      ),
    },
    {
      key: 'totalQuestions',
      label: 'Total Questions',
      render: (row) => {
        const ts = row.testSeries ? normalizeTestSeriesBlock(row.testSeries) : null
        const count = ts?.questions?.length ?? 0
        return <span className="text-sm font-medium text-[#444]">{count || '—'}</span>
      },
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled Date',
      render: (row) => {
        const ts = row.testSeries ? normalizeTestSeriesBlock(row.testSeries) : null
        const date = ts?.schedule?.date || ts?.scheduleDate
        const time = ts?.schedule?.time || ts?.scheduleTime
        if (!date) return <span className="text-sm text-[#444]">—</span>
        return (
          <span className="text-sm text-[#444]">
            {parseDateForDisplay(date)}
            {time ? ` · ${time}` : ''}
          </span>
        )
      },
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
