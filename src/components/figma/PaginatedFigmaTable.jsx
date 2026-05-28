import { useMemo, useRef } from 'react'
import { cn } from '../../utils/cn'
import { usePagination } from '../../hooks/usePagination'
import FigmaTable from './FigmaTable'
import TablePagination from './TablePagination'

const CHECKBOX_CLASS =
  'h-4 w-4 shrink-0 cursor-pointer rounded border-white/40 text-[#246392] accent-[#246392] focus:ring-[#55ace7]/50'

export default function PaginatedFigmaTable({
  columns,
  data,
  emptyMessage = 'No records found.',
  emptyState,
  className,
  rowClassName,
  itemLabel = 'records',
  initialPageSize = 10,
  resetDeps = [],
  tableRef: externalRef,
  density = 'default',
  tableClassName,
  zebraStriping = false,
  loading = false,
  skeletonRowCount = 6,
  stickyHeader = false,
  stickyLastColumn = false,
  animateRows = false,
  onRowClick,
  /** { selectedIds, onToggle(id), onTogglePage(pageIds, select), getRowId? } */
  selection,
}) {
  const internalRef = useRef(null)
  const tableRef = externalRef ?? internalRef

  const pagination = usePagination(data, { initialPageSize, resetDeps })

  const resolvedColumns = useMemo(() => {
    if (!selection) return columns
    const getRowId = selection.getRowId ?? ((row) => row.id)
    const pageIds = pagination.paginatedItems.map((row) => getRowId(row))
    const allPageSelected =
      pageIds.length > 0 && pageIds.every((id) => selection.selectedIds.includes(id))
    const somePageSelected = pageIds.some((id) => selection.selectedIds.includes(id))

    return [
      {
        key: '__select',
        label: (
          <input
            type="checkbox"
            checked={allPageSelected}
            ref={(el) => {
              if (el) el.indeterminate = somePageSelected && !allPageSelected
            }}
            onChange={() => selection.onTogglePage?.(pageIds, !allPageSelected)}
            aria-label="Select all on this page"
            className={CHECKBOX_CLASS}
          />
        ),
        headerClassName: 'w-12 pl-5 sm:pl-6',
        cellClassName: 'w-12 pl-5 sm:pl-6',
        render: (row) => {
          const id = getRowId(row)
          return (
            <input
              type="checkbox"
              checked={selection.selectedIds.includes(id)}
              onChange={() => selection.onToggle?.(id)}
              aria-label={`Select row ${id}`}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#55ace7]/40 text-[#246392] accent-[#246392] focus:ring-[#55ace7]/50"
            />
          )
        },
      },
      ...columns,
    ]
  }, [columns, selection, pagination.paginatedItems])

  const handlePageChange = (nextPage) => {
    pagination.setPage(nextPage)
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <div
      ref={tableRef}
      className={cn(
        'overflow-hidden rounded-md bg-white shadow-[0_11px_25px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      <FigmaTable
        columns={resolvedColumns}
        data={pagination.paginatedItems}
        emptyMessage={emptyMessage}
        emptyState={emptyState}
        rowClassName={rowClassName}
        density={density}
        className={cn('rounded-none shadow-none', tableClassName)}
        zebraStriping={zebraStriping}
        loading={loading}
        skeletonRowCount={skeletonRowCount}
        stickyHeader={stickyHeader}
        stickyLastColumn={stickyLastColumn}
        animateRows={animateRows}
        onRowClick={onRowClick}
      />
      {!loading && data.length > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={handlePageChange}
          onPageSizeChange={pagination.setPageSize}
          itemLabel={itemLabel}
        />
      )}
    </div>
  )
}
