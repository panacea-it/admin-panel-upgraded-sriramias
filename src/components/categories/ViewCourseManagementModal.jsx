import { BookOpen, X } from 'lucide-react'
import Modal from '../ui/Modal'
import CategoryStatusBadge from './CategoryStatusBadge'
import SectionBar from '../courses/SectionBar'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import {
  academicCourseItemToContent,
  buildHowHelpsTitle,
  buildWhyChooseTitle,
} from '../../utils/academicCourseForm'
import { cn } from '../../utils/cn'

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

function WhyChooseFeatureCard({ feature }) {
  const icon = feature.icon || feature.iconPreview
  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-4 shadow-sm',
        feature.isHighlighted ? 'border-[#55ace7]/50 ring-1 ring-[#55ace7]/20' : 'border-gray-200/90',
      )}
    >
      <div className="flex gap-3">
        {icon ? (
          <img src={icon} alt="" className="h-14 w-14 shrink-0 rounded-xl object-contain" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#fafcff] text-xs text-gray-400">
            No icon
          </div>
        )}
        <div className="min-w-0 flex-1">
          {feature.title ? (
            <h4 className="text-sm font-bold text-[#246392]">{feature.title}</h4>
          ) : null}
          {feature.description ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-[#444]">{feature.description}</p>
          ) : null}
          {feature.isHighlighted ? (
            <p className="mt-2 text-xs font-semibold text-[#55ace7]">Highlighted on website</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function ViewCourseManagementModal({ open, onClose, item }) {
  if (!open || !item) return null

  const content = academicCourseItemToContent(item)
  const whyTitle = buildWhyChooseTitle({
    examCategory: item.examCategory,
    courseName: item.name,
  })
  const howTitle = buildHowHelpsTitle(item.name)

  const keySlots = content.keyFeatures || []
  const keyTexts = keySlots.map((s) => s.text).filter(Boolean)
  const firstSlot = keySlots[0]

  return (
    <Modal open={open} onClose={onClose} size="full" title={`View ${item.name}`}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <header className="flex items-start justify-between gap-3 bg-gradient-to-r from-[#55ace7] via-[#5a7ba8] to-[#1a3a5c] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <BookOpen className="h-6 w-6 text-[#246392]" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 text-white">
              <h2 className="truncate text-lg font-bold sm:text-xl">{item.name}</h2>
              <p className="text-sm text-white/85">{item.courseId}</p>
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
              Course Details
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Course ID">{item.courseId || '—'}</DetailItem>
              <DetailItem label="Course Name">{item.name}</DetailItem>
              <DetailItem label="Centre">{item.centerName || '—'}</DetailItem>
              <DetailItem label="Program">{item.program || '—'}</DetailItem>
              <DetailItem label="Exam Category">{item.examCategory || '—'}</DetailItem>
              <DetailItem label="Exam Subcategory">{item.examSubCategory || '—'}</DetailItem>
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
          </div>

          {content.overview ? (
            <ReadOnlyBlock title="Course Overview">
              <p className="whitespace-pre-wrap">{content.overview}</p>
            </ReadOnlyBlock>
          ) : null}

          <ReadOnlyBlock title="Key Features Of Course">
            <div className="space-y-4">
              {firstSlot?.fileName ? (
                <p className="text-sm text-[#686868]">
                  Hero image: <span className="font-semibold text-[#111]">{firstSlot.fileName}</span>
                </p>
              ) : null}
              {keyTexts.length ? (
                <ul className="list-disc space-y-1 pl-5">
                  {keyTexts.map((f, i) => (
                    <li key={`${f}-${i}`}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#686868]">No features listed</p>
              )}
            </div>
          </ReadOnlyBlock>

          {content.whyChooseFeatures?.length ? (
            <div className="space-y-3">
              <SectionBar title={whyTitle} />
              <div className="grid gap-4 md:grid-cols-2">
                {content.whyChooseFeatures.map((feature) => (
                  <WhyChooseFeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </div>
          ) : item.whyChooseCourse ? (
            <ReadOnlyBlock title={whyTitle}>
              <p className="whitespace-pre-wrap">{item.whyChooseCourse}</p>
            </ReadOnlyBlock>
          ) : null}

          {(content.howWill || []).some((s) => s.fileName || s.placeholder) ? (
            <ReadOnlyBlock title={howTitle}>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {content.howWill.map((slot) =>
                  slot.fileName || slot.placeholder ? (
                    <li
                      key={slot.id}
                      className="rounded-xl border border-gray-100 bg-[#fafcff] px-3 py-3 text-sm"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-[#246392]">
                        {slot.kind === 'video' ? 'Video' : 'Image'}
                      </p>
                      <p className="mt-1 font-semibold text-[#111]">
                        {slot.fileName || slot.placeholder}
                      </p>
                    </li>
                  ) : null,
                )}
              </ul>
            </ReadOnlyBlock>
          ) : item.howCourseHelps ? (
            <ReadOnlyBlock title={howTitle}>
              <p className="whitespace-pre-wrap">{item.howCourseHelps}</p>
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
