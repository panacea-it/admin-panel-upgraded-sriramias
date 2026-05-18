import { useRef, useState } from 'react'
import { Edit3, ImageIcon, Layers, Trash2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import SectionBar from '../courses/SectionBar'
import { CourseFormField, CourseInput } from '../courses/CourseFormField'
import { StatusBadge } from '../academics/AcademicsUi'
import { cn } from '../../utils/cn'

export default function ModifyFreeResourceCategoryModal({
  open,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) {
  const imageRef = useRef(null)
  const [name, setName] = useState('')
  const [imageName, setImageName] = useState('')

  const handleClose = () => {
    setName('')
    setImageName('')
    onClose()
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Enter a category name')
      return
    }
    onAddCategory?.({ name: name.trim(), imageName })
    setName('')
    setImageName('')
    if (imageRef.current) imageRef.current.value = ''
    toast.success('Category added')
  }

  return (
    <Modal open={open} onClose={handleClose} size="full">
      <div className="overflow-hidden rounded-xl bg-[#f7f7f7] shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <ModalPanelHeader title="Modify Free Resource Category" onBack={handleClose} icon={Layers} />

        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          <SectionBar title="Add New Category" />
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <CourseFormField label="Category Name" required>
              <CourseInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
              />
            </CourseFormField>
            <CourseFormField label="Background Image" required>
              <div className="relative">
                <CourseInput
                  readOnly
                  value={imageName}
                  placeholder="Upload background image"
                  className="pr-12"
                />
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => setImageName(e.target.files?.[0]?.name || '')}
                />
                <ImageIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55ace7]" />
              </div>
            </CourseFormField>
            <div className="flex items-end sm:col-span-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1a3a5c] px-8 text-sm font-bold text-white shadow-[0_4px_12px_rgba(26,58,92,0.35)] transition hover:bg-[#152f4a]"
              >
                Add Category
              </button>
            </div>
          </form>

          <SectionBar title="Modify Existing Category" />

          <div className="overflow-hidden rounded-t-md bg-white shadow-[0_11px_25px_rgba(15,23,42,0.06)]">
            <div className="overflow-x-auto">
              <table className="min-w-[520px] w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-[#55ace7] to-[#246392] text-sm font-semibold text-white sm:text-base">
                    <th className="px-6 py-3">Course Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className={cn(
                        'border-b border-slate-100 text-sm font-medium text-[#111] last:border-0 sm:text-base',
                        cat.id % 2 === 0 && 'bg-slate-50/60',
                      )}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-4">
                          <span className="h-6 w-6 shrink-0 rounded bg-[#cbeeff]" />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={cat.status} />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap items-center gap-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-[#686868] transition hover:text-[#246392]"
                          >
                            <Edit3 className="h-4 w-4" strokeWidth={2.35} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteCategory?.(cat.id)
                              toast.success('Category removed')
                            }}
                            className="inline-flex items-center gap-2 text-[#c96565] transition hover:text-[#b94b4b]"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2.1} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
