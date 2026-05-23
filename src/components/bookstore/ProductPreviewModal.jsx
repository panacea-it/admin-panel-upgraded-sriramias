import BookstoreModal from './modal/BookstoreModal'
import BookstoreStatusBadge from './BookstoreStatusBadge'
import { formatINR } from '../../utils/financeFilters'

export default function ProductPreviewModal({ open, onClose, product }) {
  if (!product) return null

  return (
    <BookstoreModal
      open={open}
      onClose={onClose}
      title={product.name}
      subtitle={`Product preview · ${product.id}`}
      size="md"
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-[#686868]">Type</dt>
          <dd className="mt-0.5 font-medium text-[#111]">{product.productType}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[#686868]">Status</dt>
          <dd className="mt-0.5"><BookstoreStatusBadge status={product.status} /></dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[#686868]">Subject</dt>
          <dd className="mt-0.5">{product.subject || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[#686868]">Author</dt>
          <dd className="mt-0.5">{product.authorName || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[#686868]">ISBN</dt>
          <dd className="mt-0.5">{product.isbn || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[#686868]">Stock</dt>
          <dd className="mt-0.5 font-semibold">{product.stockQuantity}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[#686868]">Price</dt>
          <dd className="mt-0.5">
            <span className="font-bold text-[#7c5cbf]">{formatINR(product.discountPrice)}</span>
            {product.originalPrice > product.discountPrice && (
              <span className="ml-2 text-[#9ca0a8] line-through">{formatINR(product.originalPrice)}</span>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-[#686868]">Description</dt>
          <dd className="mt-1 leading-relaxed text-[#444]">{product.description || 'No description.'}</dd>
        </div>
      </dl>
    </BookstoreModal>
  )
}
