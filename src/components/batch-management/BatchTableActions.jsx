import { Eye, Pencil, Users } from 'lucide-react'
import TableActionMenu from '../common/TableActionMenu'

export default function BatchTableActions({ batch, onViewDetails, onEdit, onQuickView }) {
  const items = [
    {
      label: 'Batch Details',
      icon: Users,
      onClick: () => onViewDetails?.(batch),
    },
    {
      label: 'Quick View',
      icon: Eye,
      onClick: () => onQuickView?.(batch),
    },
    {
      label: 'Edit Batch',
      icon: Pencil,
      onClick: () => onEdit?.(batch),
    },
  ]

  return (
    <TableActionMenu
      items={items}
      triggerLabel={`Actions for ${batch.displayName || 'batch'}`}
    />
  )
}
