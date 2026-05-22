import { AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Users } from 'lucide-react'
import { usePagination } from '../../hooks/usePagination'
import TablePagination from '../figma/TablePagination'
import CategoryStatusBadge from '../categories/CategoryStatusBadge'
import BatchStudentPanel from './BatchStudentPanel'
import { formatBatchDate } from '../../data/batchManagementData'
import { cn } from '../../utils/cn'

export default function BatchManagementTable({
  batches,
  expandedBatchId,
  onToggleBatch,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onToggleStudentStatus,
  resetDeps = [],
}) {
  const pagination = usePagination(batches, {
    initialPageSize: 10,
    resetDeps,
  })

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="bg-gradient-to-r from-[#55ace7] to-[#246392] text-sm font-semibold text-white sm:text-base">
              <th className="w-10 px-4 py-3.5 sm:pl-6" aria-hidden />
              <th className="px-4 py-3.5">Batch ID</th>
              <th className="px-4 py-3.5 sm:px-5">Batch Name</th>
              <th className="px-4 py-3.5">Course Name</th>
              <th className="px-4 py-3.5">Trainer Name</th>
              <th className="px-4 py-3.5">Start Date</th>
              <th className="px-4 py-3.5">End Date</th>
              <th className="px-4 py-3.5">Total Students</th>
              <th className="px-4 py-3.5 sm:pr-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {pagination.paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm font-medium text-slate-500">
                  No batches found.
                </td>
              </tr>
            ) : (
              pagination.paginatedItems.map((batch) => {
                const isExpanded = expandedBatchId === batch.id
                return (
                  <BatchRowGroup
                    key={batch.id}
                    batch={batch}
                    isExpanded={isExpanded}
                    onToggle={() => onToggleBatch(batch.id)}
                    onAddStudent={onAddStudent}
                    onUpdateStudent={onUpdateStudent}
                    onDeleteStudent={onDeleteStudent}
                    onToggleStudentStatus={onToggleStudentStatus}
                  />
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {batches.length > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="batches"
        />
      )}
    </div>
  )
}

function BatchRowGroup({
  batch,
  isExpanded,
  onToggle,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onToggleStudentStatus,
}) {
  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
        className={cn(
          'cursor-pointer border-b border-slate-100 transition-colors duration-150',
          isExpanded ? 'bg-[#eef6fc]' : 'hover:bg-[#f8fbff]',
        )}
        aria-expanded={isExpanded}
      >
        <td className="px-4 py-4 sm:pl-6">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition',
              isExpanded ? 'bg-[#55ace7] text-white' : 'bg-slate-100 text-[#686868]',
            )}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="font-mono text-sm font-semibold text-[#246392]">
            {batch.batchId}
          </span>
        </td>
        <td className="px-4 py-4 sm:px-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="group text-left"
          >
            <span className="font-semibold text-[#246392] underline-offset-2 transition group-hover:text-[#1a3a5c] group-hover:underline">
              {batch.displayName}
            </span>
          </button>
        </td>
        <td className="px-4 py-4 text-sm font-medium text-[#444]">{batch.courseName}</td>
        <td className="px-4 py-4 text-sm text-[#444]">{batch.trainerName}</td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#444]">
          {formatBatchDate(batch.startDate)}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#444]">
          {formatBatchDate(batch.endDate)}
        </td>
        <td className="px-4 py-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-[#333]">
            <Users className="h-3.5 w-3.5 text-[#246392]" />
            {batch.totalStudents}
          </span>
        </td>
        <td className="px-4 py-4 sm:pr-6">
          <CategoryStatusBadge status={batch.status} />
        </td>
      </tr>
      <tr className="border-b border-slate-100 last:border-0">
        <td colSpan={9} className="p-0">
          <AnimatePresence initial={false}>
            {isExpanded && (
              <BatchStudentPanel
                batch={batch}
                onAddStudent={onAddStudent}
                onUpdateStudent={onUpdateStudent}
                onDeleteStudent={onDeleteStudent}
                onToggleStudentStatus={onToggleStudentStatus}
              />
            )}
          </AnimatePresence>
        </td>
      </tr>
    </>
  )
}
