import { cn } from '../../utils/cn'

export default function FigmaTable({
  columns,
  data,
  emptyMessage = 'No records found.',
  className,
}) {
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
            <tr className="h-12 min-h-[50px] bg-gradient-to-r from-[#55ace7] to-[#246392] text-sm font-semibold leading-none text-white sm:text-base lg:text-lg">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('whitespace-nowrap px-4 py-3 first:pl-6 sm:px-6', col.headerClassName)}
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
                className="h-14 min-h-[58px] border-b border-slate-100 text-sm font-medium text-[#111111] last:border-0 sm:text-base"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3 first:pl-6 sm:px-6', col.cellClassName)}
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
