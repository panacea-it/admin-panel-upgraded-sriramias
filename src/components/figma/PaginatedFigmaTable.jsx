import { useRef } from 'react'
import { cn } from '../../utils/cn'
import { usePagination } from '../../hooks/usePagination'
import FigmaTable from './FigmaTable'
import TablePagination from './TablePagination'

export default function PaginatedFigmaTable({
  columns,
  data,
  emptyMessage = 'No records found.',
  className,
  rowClassName,
  itemLabel = 'records',
  initialPageSize = 10,
  resetDeps = [],
  tableRef: externalRef,
  density = 'default',
  tableClassName,
}) {
  const internalRef = useRef(null)
  const tableRef = externalRef ?? internalRef

  const pagination = usePagination(data, { initialPageSize, resetDeps })

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
        columns={columns}
        data={pagination.paginatedItems}
        emptyMessage={emptyMessage}
        rowClassName={rowClassName}
        density={density}
        className={cn('rounded-none shadow-none', tableClassName)}
      />
      {data.length > 0 && (
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
