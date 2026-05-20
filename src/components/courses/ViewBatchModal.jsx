import { BookMarked, X } from 'lucide-react'
import Modal from '../ui/Modal'
import SectionBar from './SectionBar'
import CategoryStatusBadge from '../categories/CategoryStatusBadge'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { formatLinkedSubjectDisplay, normalizeLinkedSubjects } from '../../utils/batchHelpers'

function DetailItem({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#686868]">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[#111]">{children}</div>
    </div>
  )
}

function ReadOnlyBlock({ title, children }) {
  if (!children) return null
  return (
    <div className="space-y-3">
      <SectionBar title={title} />
      <div className="rounded-xl bg-white px-4 py-4 text-sm text-[#444] shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6">
        {children}
      </div>
    </div>
  )
}

export default function ViewBatchModal({ open, onClose, item }) {
  if (!open || !item) return null

  const form = item.formData || {}
  const linkedSubjects = normalizeLinkedSubjects({ ...form, linkedSubjects: item.linkedSubjects })
  const bannerSrc = item.bannerPreview || form.bannerPreview || form.bannerUrl

  return (
    <Modal open={open} onClose={onClose} size="full" title={`View ${item.batchName || item.name}`}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <header className="flex items-start justify-between gap-3 bg-gradient-to-r from-[#55ace7] via-[#8b98bb] to-[#b8887a] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <BookMarked className="h-6 w-6 text-[#dc2626]" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 text-white">
              <h2 className="truncate text-lg font-bold sm:text-xl">
                {item.batchName || item.name}
              </h2>
              <p className="text-sm text-white/85">{item.batchId || '—'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto bg-[#f0f4f8] p-5 sm:p-6">
          <div className="rounded-xl bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:p-6">
            <h3 className="mb-4 border-b border-[#eef2fc] pb-2 text-sm font-bold uppercase tracking-wide text-[#246392]">
              Batch Details
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Batch ID">{item.batchId || '—'}</DetailItem>
              <DetailItem label="Batch Name">{item.batchName || item.name}</DetailItem>
              <DetailItem label="Course ID">{item.courseId || '—'}</DetailItem>
              <DetailItem label="Date of Commencement">
                {item.commencement || form.commencement || '—'}
              </DetailItem>
              <DetailItem label="Duration">
                {item.durationLabel || form.durationLabel || '—'}
              </DetailItem>
              <DetailItem label="Batch Start Date">
                {item.batchStartFrom || form.batchStartFrom || '—'}
              </DetailItem>
              <DetailItem label="Batch End Date">
                {item.batchEndTo || form.batchEndTo || '—'}
              </DetailItem>
              <DetailItem label="Status">
                <CategoryStatusBadge status={item.status} />
              </DetailItem>
              <DetailItem label="Created On">
                {formatCategoryDateTime(item.createdAt)}
              </DetailItem>
              <DetailItem label="Modified On">
                {formatCategoryDateTime(item.modifiedAt)}
              </DetailItem>
            </dl>
            {bannerSrc ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-[#686868]">Banner Image</p>
                <img
                  src={bannerSrc}
                  alt="Batch banner"
                  className="mt-2 max-h-48 rounded-lg border border-[#eef2fc] object-contain"
                />
              </div>
            ) : null}
          </div>

          <ReadOnlyBlock title="Linked Subjects">
            {linkedSubjects.length ? (
              <ul className="flex flex-wrap gap-2">
                {linkedSubjects.map((s) => (
                  <li
                    key={s.subjectId}
                    className="rounded-full bg-[#e8f4fc] px-3 py-1.5 text-xs font-semibold text-[#246392]"
                  >
                    {formatLinkedSubjectDisplay(s)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#686868]">No subjects linked</p>
            )}
          </ReadOnlyBlock>

          {(form.onlineFees || form.offlineFees) && (
            <ReadOnlyBlock title="Fee Details">
              <div className="grid gap-2 sm:grid-cols-2">
                {form.onlineFees ? <p>Online: {form.onlineFees}</p> : null}
                {form.offlineFees ? <p>Offline: {form.offlineFees}</p> : null}
              </div>
            </ReadOnlyBlock>
          )}

          {form.overview ? (
            <ReadOnlyBlock title="Course Overview">
              <p className="whitespace-pre-wrap">{form.overview}</p>
            </ReadOnlyBlock>
          ) : null}
        </div>

        <footer className="sticky bottom-0 border-t border-[#eef2fc] bg-[#fafafa] px-5 py-4 text-right sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[120px] rounded-full bg-gradient-to-r from-[#0d3b66] to-[#05192d] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110"
          >
            Close
          </button>
        </footer>
      </div>
    </Modal>
  )
}
