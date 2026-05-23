import { useRef, useState } from 'react'
import { getModalEditKey, useInitOnModalOpen } from '../../hooks/modalFormSync'
import { ImagePlus, X } from 'lucide-react'
import { toast } from '@/utils/toast'
import Modal from '../ui/Modal'
import FormModalSubmitBar from '../common/FormModalSubmitBar'
import {
  CourseFormField,
  CourseInput,
  CourseSelect,
} from '../courses/CourseFormField'
import { USER_ROLES, USER_STATUS_OPTIONS } from '../../data/manageUsersConfig'
import { createManageUser, updateManageUser } from '../../utils/manageUsersStorage'
import { cn } from '../../utils/cn'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRe = /^[6-9]\d{9}$/

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  parentName: '',
  parentPhone: '',
  role: 'student',
  assignedCenter: '',
  status: 'Active',
  profileImage: '',
}

export default function UserFormModal({
  open,
  onClose,
  onSuccess,
  editingUser = null,
  centerOptions = [],
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const editingRef = useRef(editingUser)
  editingRef.current = editingUser
  const editKey = getModalEditKey(editingUser)

  useInitOnModalOpen(open, editKey, () => {
    const row = editingRef.current
    if (row) {
      setForm({
        fullName: row.fullName || '',
        email: row.email || '',
        phone: row.phone || '',
        parentName: row.parentName || '',
        parentPhone: row.parentPhone || '',
        role: row.role || 'student',
        assignedCenter: row.assignedCenter || '',
        status: row.status || 'Active',
        profileImage: row.profileImage || '',
      })
    } else {
      setForm({
        ...emptyForm,
        assignedCenter: centerOptions[0] || '',
      })
    }
    setErrors({})
  })

  const validate = () => {
    const next = {}
    if (!form.fullName?.trim()) next.fullName = 'Full name is required'
    if (!form.email?.trim()) next.email = 'Email is required'
    else if (!emailRe.test(form.email.trim())) next.email = 'Enter a valid email'
    if (!form.phone?.trim()) next.phone = 'Phone number is required'
    else if (!phoneRe.test(form.phone.trim())) next.phone = 'Enter a valid 10-digit mobile number'
    if (!form.role) next.role = 'Role is required'
    if (!form.assignedCenter?.trim()) next.assignedCenter = 'Assigned center is required'
    if (form.parentPhone?.trim() && !phoneRe.test(form.parentPhone.trim())) {
      next.parentPhone = 'Enter a valid 10-digit parent mobile number'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, profileImage: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setSaving(true)
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
      role: form.role,
      assignedCenter: form.assignedCenter.trim(),
      status: form.status,
      profileImage: form.profileImage,
    }
    const res = editingUser
      ? updateManageUser(editingUser.id, payload)
      : createManageUser(payload)
    setSaving(false)
    if (!res.ok) {
      toast.error(res.reason || 'Failed to save user')
      return
    }
    toast.success(editingUser ? 'User updated' : 'User created')
    onSuccess?.()
    onClose()
  }

  const isEdit = Boolean(editingUser)

  return (
    <Modal open={open} onClose={onClose} size="lg" title={isEdit ? 'Edit User' : 'Add User'}>
      <form onSubmit={handleSubmit} className="flex max-h-[min(85vh,680px)] flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <CourseFormField label="Full Name" required className="sm:col-span-2">
              <CourseInput
                value={form.fullName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                  if (errors.fullName) setErrors((e2) => ({ ...e2, fullName: undefined }))
                }}
                placeholder="e.g. Arjun Mehta"
              />
              {errors.fullName && (
                <p className="text-xs font-medium text-red-600">{errors.fullName}</p>
              )}
            </CourseFormField>

            <CourseFormField label="Email" required>
              <CourseInput
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }))
                  if (errors.email) setErrors((e2) => ({ ...e2, email: undefined }))
                }}
                placeholder="user@sriramias.in"
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-600">{errors.email}</p>
              )}
            </CourseFormField>

            <CourseFormField label="Phone Number" required>
              <CourseInput
                value={form.phone}
                onChange={(e) => {
                  setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
                  if (errors.phone) setErrors((e2) => ({ ...e2, phone: undefined }))
                }}
                placeholder="10-digit mobile"
              />
              {errors.phone && (
                <p className="text-xs font-medium text-red-600">{errors.phone}</p>
              )}
            </CourseFormField>

            <CourseFormField label="Parent Name">
              <CourseInput
                value={form.parentName}
                onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))}
                placeholder="e.g. Rajesh Mehta"
              />
            </CourseFormField>

            <CourseFormField label="Parent Phone Number">
              <CourseInput
                value={form.parentPhone}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    parentPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                  }))
                  if (errors.parentPhone) setErrors((e2) => ({ ...e2, parentPhone: undefined }))
                }}
                placeholder="10-digit parent mobile"
              />
              {errors.parentPhone && (
                <p className="text-xs font-medium text-red-600">{errors.parentPhone}</p>
              )}
            </CourseFormField>

            <CourseFormField label="Role" required>
              <CourseSelect
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                {USER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>

            <CourseFormField label="Assigned Center" required>
              <CourseSelect
                value={form.assignedCenter}
                onChange={(e) => {
                  setForm((f) => ({ ...f, assignedCenter: e.target.value }))
                  if (errors.assignedCenter) {
                    setErrors((e2) => ({ ...e2, assignedCenter: undefined }))
                  }
                }}
              >
                <option value="">Select center</option>
                {centerOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </CourseSelect>
              {errors.assignedCenter && (
                <p className="text-xs font-medium text-red-600">{errors.assignedCenter}</p>
              )}
            </CourseFormField>

            <CourseFormField label="Status">
              <CourseSelect
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {USER_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </CourseSelect>
            </CourseFormField>

            <CourseFormField label="Profile Pic" className="sm:col-span-2">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d4e4f4] bg-[#fafcff] transition hover:border-[#55ace7]',
                  )}
                >
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-[#246392]" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-sm font-semibold text-[#246392] hover:underline"
                  >
                    Upload photo
                  </button>
                  <p className="mt-1 text-xs text-[#686868]">Optional — JPG or PNG</p>
                  {form.profileImage ? (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, profileImage: '' }))}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#c96565] hover:underline"
                    >
                      <X className="h-3 w-3" />
                      Remove image
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImage}
                />
              </div>
            </CourseFormField>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#e5eaf2] bg-[#f8fafc] px-5 py-4 sm:px-8">
          <FormModalSubmitBar
            isEditMode={isEdit}
            onReset={() => {
              setForm(isEdit ? { ...form } : { ...emptyForm, assignedCenter: centerOptions[0] || '' })
              setErrors({})
            }}
            createLabel={saving ? 'Saving…' : 'Create User'}
            updateLabel={saving ? 'Saving…' : 'Update User'}
          />
        </div>
      </form>
    </Modal>
  )
}
