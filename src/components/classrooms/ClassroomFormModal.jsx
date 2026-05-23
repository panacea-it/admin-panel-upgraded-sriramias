import { useEffect, useState } from 'react'
import { DoorOpen } from 'lucide-react'
import Modal from '../ui/Modal'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import ModalPanelHeader from '../courses/ModalPanelHeader'
import { cn } from '../../utils/cn'

const EMPTY = {
  name: '',
  code: '',
  capacity: '',
  description: '',
  status: 'Active',
}

export default function ClassroomFormModal({ open, onClose, classroom, onSave, saving }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    if (classroom) {
      setForm({
        name: classroom.name || '',
        code: classroom.code || '',
        capacity: classroom.capacity ?? '',
        description: classroom.description || '',
        status: classroom.status || 'Active',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [open, classroom])

  const update = (key) => (e) => {
    const val = e.target.value
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Classroom name is required'
    if (!form.code.trim()) next.code = 'Classroom code is required'
    if (form.capacity !== '' && Number(form.capacity) < 1) {
      next.capacity = 'Capacity must be at least 1'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await onSave(form)
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <ModalPanelHeader
          icon={DoorOpen}
          title={classroom ? 'Edit Classroom' : 'Add Classroom'}
          subtitle="Manage room details and capacity"
          onBack={onClose}
        />
        <div className="space-y-4 px-5 py-4 sm:px-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#333]">
              Classroom Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. Class Room 1"
              className={cn(
                'h-11 w-full rounded-xl bg-[#d1e9f6] px-4 text-sm outline-none focus:ring-2 focus:ring-[#55ace7]/40',
                errors.name && 'ring-2 ring-red-400',
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#333]">
              Classroom Code / Room Number <span className="text-red-500">*</span>
            </label>
            <input
              value={form.code}
              onChange={update('code')}
              placeholder="e.g. CR-01"
              className={cn(
                'h-11 w-full rounded-xl bg-[#d1e9f6] px-4 text-sm uppercase outline-none focus:ring-2 focus:ring-[#55ace7]/40',
                errors.code && 'ring-2 ring-red-400',
              )}
            />
            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#333]">Capacity (optional)</label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={update('capacity')}
              placeholder="e.g. 40"
              className={cn(
                'h-11 w-full rounded-xl bg-[#d1e9f6] px-4 text-sm outline-none focus:ring-2 focus:ring-[#55ace7]/40',
                errors.capacity && 'ring-2 ring-red-400',
              )}
            />
            {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#333]">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={update('description')}
              rows={3}
              placeholder="Notes about equipment, floor, etc."
              className="w-full rounded-xl bg-[#d1e9f6] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#55ace7]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#333]">Status</label>
            <select
              value={form.status}
              onChange={update('status')}
              className="h-11 w-full rounded-xl bg-[#d1e9f6] px-4 text-sm outline-none focus:ring-2 focus:ring-[#55ace7]/40"
            >
              <option value="Active">Active</option>
              <option value="In Active">In Active</option>
            </select>
          </div>
        </div>
        <FormModalSubmitBar
          onCancel={onClose}
          submitLabel={classroom ? 'Update' : 'Save'}
          loading={saving}
        />
      </form>
    </Modal>
  )
}
