import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import BookstorePageShell from '../../components/bookstore/BookstorePageShell'
import BookstoreStatusBadge from '../../components/bookstore/BookstoreStatusBadge'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchBookstoreRecommendations } from '../../api/bookstoreAPI'

export default function BookstoreRecommendationsPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchBookstoreRecommendations().then((res) => setItems(res?.items || []))
  }, [])

  const columns = [
    { key: 'type', label: 'Rule type' },
    { key: 'sourceProductId', label: 'Source product' },
    { key: 'targetProductIds', label: 'Targets', render: (r) => r.targetProductIds?.join(', ') },
    { key: 'status', label: 'Status', render: (r) => <BookstoreStatusBadge status={r.status} /> },
  ]

  return (
    <BookstorePageShell icon={Sparkles} title="Recommendation Engine">
      <p className="rounded-xl bg-white p-4 text-sm text-[#686868] shadow-sm">
        Configure related products, frequently bought together, best sellers, and cross-sell mappings.
      </p>
      <PaginatedFigmaTable columns={columns} data={items} itemLabel="rules" />
    </BookstorePageShell>
  )
}
