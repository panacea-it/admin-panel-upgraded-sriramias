import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../ui/Button'
import { BOOKSTORE_PRODUCT_TYPES } from '../../data/bookstoreMockData'
import BookstoreModal, { BookstoreModalFooter } from './modal/BookstoreModal'
import { BOOKSTORE_INPUT_CLASS, BOOKSTORE_LABEL_CLASS } from './modal/bookstoreFormStyles'

const EMPTY = {
  name: '',
  productType: 'Physical Book',
  description: '',
  subject: '',
  authorName: '',
  isbn: '',
  language: 'English',
  originalPrice: '',
  discountPrice: '',
  stockQuantity: '',
  weight: '',
  dimensions: '',
  status: 'active',
}

export default function ProductFormModal({ open, onClose, initial, onSubmit, loading }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    if (initial) {
      reset({
        ...EMPTY,
        ...initial,
        originalPrice: String(initial.originalPrice ?? ''),
        discountPrice: String(initial.discountPrice ?? ''),
        stockQuantity: String(initial.stockQuantity ?? ''),
      })
    } else {
      reset(EMPTY)
    }
  }, [open, initial, reset])

  const submit = (values) => {
    onSubmit({
      ...values,
      originalPrice: Number(values.originalPrice) || 0,
      discountPrice: Number(values.discountPrice) || 0,
      stockQuantity: Number(values.stockQuantity) || 0,
    })
  }

  return (
    <BookstoreModal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Product' : 'Add Product'}
      subtitle={initial ? `SKU ${initial.id}` : 'Create a new bookstore product listing'}
      size="xl"
      loading={loading}
      footer={
        <BookstoreModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="bookstore-product-form" disabled={loading}>
            {initial ? 'Save changes' : 'Create product'}
          </Button>
        </BookstoreModalFooter>
      }
    >
      <form id="bookstore-product-form" onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={BOOKSTORE_LABEL_CLASS}>Product Name *</span>
          <input className={BOOKSTORE_INPUT_CLASS} {...register('name', { required: true })} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Product Type</span>
          <select className={BOOKSTORE_INPUT_CLASS} {...register('productType')}>
            {BOOKSTORE_PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Subject</span>
          <input className={BOOKSTORE_INPUT_CLASS} {...register('subject')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Author Name</span>
          <input className={BOOKSTORE_INPUT_CLASS} {...register('authorName')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>ISBN</span>
          <input className={BOOKSTORE_INPUT_CLASS} {...register('isbn')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Language</span>
          <input className={BOOKSTORE_INPUT_CLASS} {...register('language')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Original Price (₹)</span>
          <input type="number" min="0" className={BOOKSTORE_INPUT_CLASS} {...register('originalPrice')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Discount Price (₹)</span>
          <input type="number" min="0" className={BOOKSTORE_INPUT_CLASS} {...register('discountPrice')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Stock Quantity</span>
          <input type="number" min="0" className={BOOKSTORE_INPUT_CLASS} {...register('stockQuantity')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Status</span>
          <select className={BOOKSTORE_INPUT_CLASS} {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Weight</span>
          <input className={BOOKSTORE_INPUT_CLASS} {...register('weight')} />
        </label>
        <label>
          <span className={BOOKSTORE_LABEL_CLASS}>Dimensions</span>
          <input className={BOOKSTORE_INPUT_CLASS} {...register('dimensions')} />
        </label>
        <label className="sm:col-span-2">
          <span className={BOOKSTORE_LABEL_CLASS}>Description</span>
          <textarea rows={4} className={BOOKSTORE_INPUT_CLASS} {...register('description')} />
        </label>
      </form>
    </BookstoreModal>
  )
}
