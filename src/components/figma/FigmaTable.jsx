import { cn } from '../../utils/cn'

const DENSITY = {
  default: {
    header: 'h-12 min-h-[48px] text-sm font-semibold sm:text-base lg:text-lg',
    row: 'min-h-[60px] text-sm font-medium sm:text-base',
    cell: 'px-4 py-3 sm:px-6',
  },
  compact: {
    header: 'h-11 min-h-[44px] text-sm font-semibold',
    row: 'h-14 min-h-[56px] text-sm font-medium',
    cell: 'px-5 py-0 align-middle sm:px-6',
  },
  helpdesk: {
    header: 'h-12 min-h-[48px] text-sm font-semibold',
    row: 'min-h-[72px] text-sm font-medium',
    cell: 'px-5 py-3.5 align-middle sm:px-6',
  },
}

export default function FigmaTable({
  columns,
  data,
  emptyMessage = 'No records found.',
  className,
  rowClassName,
  density = 'default',
}) {
  const d = DENSITY[density] ?? DENSITY.default
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-t-md bg-white shadow-[0_11px_25px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      <div className="min-w-[640px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              className={cn(
                'bg-gradient-to-r from-[#55ace7] to-[#246392] leading-none text-white',
                d.header,
              )}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap align-middle first:pl-6 sm:first:pl-8',
                    d.cell,
                    col.headerClassName,
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className={cn(
                  'border-b border-slate-100/90 text-[#111111] transition-colors duration-150 last:border-0 hover:bg-[#f8fbff]',
                  d.row,
                  rowClassName,
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('first:pl-6 sm:first:pl-8', d.cell, col.cellClassName)}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="py-8 text-center text-sm font-medium text-slate-500">
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  )
}
