import { cn } from '../../utils/cn'

export default function BlogStatusBadge({ status }) {
  const published = status === 'published'
  return (
    <span
      className={cn(
        'inline-flex min-w-[88px] items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold capitalize text-white',
        published ? 'bg-[#69df66]' : 'bg-[#efb36d]',
      )}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}
