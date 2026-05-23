import { useMemo } from 'react'
import SectionBar from './SectionBar'
import {
  CourseFormField,
  CourseInput,
  CourseTextarea,
} from './CourseFormField'
import BlogRichEditor from '../blogs/BlogRichEditor'
import TagInput from '../blogs/TagInput'
import { cn } from '../../utils/cn'
import {
  BATCH_KEYWORD_SUGGESTIONS,
  BATCH_TAG_SUGGESTIONS,
  buildBatchSearchPreview,
} from '../../utils/batchSeoForm'
import {
  META_DESCRIPTION_LIMIT,
  META_TITLE_LIMIT,
  isOverLimit,
  seoCharCount,
  seoLimitTone,
} from '../../utils/blogSeo'

function CharCounter({ text, limit }) {
  const count = seoCharCount(text)
  const over = isOverLimit(text, limit)
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={cn('text-xs font-medium', seoLimitTone(count, limit))}>
        {count} / {limit}
      </span>
      {over ? (
        <span className="text-xs font-semibold text-amber-600">
          Recommended limit exceeded
        </span>
      ) : null}
    </div>
  )
}

function FieldHint({ children }) {
  return <p className="text-xs leading-relaxed text-[#686868]">{children}</p>
}

function SubsectionTitle({ children }) {
  return (
    <h4 className="border-b border-[#eef2fc] pb-2 text-sm font-bold text-[#246392]">
      {children}
    </h4>
  )
}

function ContextChip({ label, value }) {
  if (!value) return null
  return (
    <span className="inline-flex max-w-full flex-col rounded-lg bg-white px-3 py-2 text-left ring-1 ring-[#eef2fc] sm:min-w-[140px]">
      <span className="text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </span>
      <span className="truncate text-sm font-semibold text-[#111]">{value}</span>
    </span>
  )
}

/** SEO & content for this batch only — preview uses Batch Details title, course, subjects. */
export default function BatchSeoSection({ form, setForm, errors = {} }) {
  const seo = form.seo || {}

  const updateSeo = (key, value) => {
    setForm((f) => ({
      ...f,
      seo: { ...(f.seo || {}), [key]: value },
    }))
  }

  const preview = useMemo(() => buildBatchSearchPreview(form, seo), [form, seo])

  return (
    <div className="space-y-4">
      <SectionBar title="SEO & Content" />
      <div className="space-y-6 rounded-xl border border-gray-100 bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6">
        <p className="text-sm text-[#686868]">
          SEO and page content apply to <strong className="text-[#333]">this batch only</strong>.
          Search preview uses the batch name, course, and subjects from{' '}
          <strong className="text-[#333]">Batch Details</strong> when meta fields are left empty
          — not a separate course category.
        </p>

        <div className="rounded-xl border border-[#d9ebf9] bg-[#f8fbff] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#246392]">
            Based on this batch (Batch Details)
          </p>
          <div className="flex flex-wrap gap-2">
            <ContextChip label="Batch title" value={preview.context.batchName} />
            <ContextChip label="Course" value={preview.context.courseName} />
            <ContextChip label="Duration" value={preview.context.durationLabel} />
            <ContextChip
              label="Subjects"
              value={
                preview.context.subjectNames.length
                  ? preview.context.subjectNames.join(', ')
                  : ''
              }
            />
          </div>
          {!preview.context.batchName && !preview.context.courseName ? (
            <p className="mt-3 text-xs text-amber-700">
              Fill batch name and course in Batch Details above to drive the search preview.
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-[#eef2fc] bg-[#fafcff] p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#246392]">
            Search preview
          </p>
          <p className="mb-3 text-xs text-[#686868]">
            {preview.titleFromBatch || preview.descriptionFromBatch
              ? 'Italic lines use Batch Details until you enter meta fields below.'
              : 'Showing your custom meta title and description.'}
          </p>
          <div className="space-y-1 rounded-lg bg-white p-3 font-[Arial,sans-serif] ring-1 ring-[#eef2fc]">
            <p
              className={cn(
                'text-xl leading-snug text-[#1a0dab]',
                preview.titleFromBatch && 'italic text-[#545454]',
              )}
            >
              {preview.title}
            </p>
            <p className="text-sm text-[#006621]">{preview.url}</p>
            <p
              className={cn(
                'line-clamp-3 text-sm leading-relaxed text-[#545454]',
                preview.descriptionFromBatch && 'italic',
              )}
            >
              {preview.description}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <SubsectionTitle>SEO for search engines</SubsectionTitle>

          <CourseFormField label="Meta Title">
            <FieldHint>SEO title for search engines</FieldHint>
            <CourseInput
              value={seo.metaTitle || ''}
              onChange={(e) => updateSeo('metaTitle', e.target.value)}
              placeholder={
                preview.context.batchName
                  ? `e.g. ${[preview.context.batchName, preview.context.courseName].filter(Boolean).join(' | ')}`
                  : 'SEO title for search engines'
              }
              className="mt-2"
            />
            <CharCounter text={seo.metaTitle} limit={META_TITLE_LIMIT} />
            {preview.titleFromBatch ? (
              <FieldHint>Empty → uses batch title and course from Batch Details.</FieldHint>
            ) : null}
          </CourseFormField>

          <CourseFormField label="Meta Description">
            <FieldHint>
              Brief summary for search results (recommended 150–160 characters)
            </FieldHint>
            <CourseTextarea
              rows={4}
              value={seo.metaDescription || ''}
              onChange={(e) => updateSeo('metaDescription', e.target.value)}
              placeholder="Brief summary for search results (recommended 150–160 characters)"
              className="mt-2"
            />
            <CharCounter text={seo.metaDescription} limit={META_DESCRIPTION_LIMIT} />
            {preview.descriptionFromBatch ? (
              <FieldHint>Empty → built from batch name, course, duration, and subjects.</FieldHint>
            ) : null}
          </CourseFormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <CourseFormField label="Focus Keywords">
              <FieldHint>Type keyword and press Enter</FieldHint>
              <div className="mt-2">
                <TagInput
                  value={seo.focusKeywords || []}
                  onChange={(keywords) => updateSeo('focusKeywords', keywords)}
                  suggestions={BATCH_KEYWORD_SUGGESTIONS}
                  placeholder="Type keyword and press Enter"
                  allowCustom
                />
              </div>
              <FieldHint>Pick from suggestions or add your own keywords.</FieldHint>
            </CourseFormField>

            <CourseFormField label="Tags">
              <FieldHint>Search or add tags</FieldHint>
              <div className="mt-2">
                <TagInput
                  value={seo.tags || []}
                  onChange={(tags) => updateSeo('tags', tags)}
                  suggestions={BATCH_TAG_SUGGESTIONS}
                  placeholder="Search or add tags"
                  allowCustom
                />
              </div>
              <FieldHint>
                Tags appear as chips — click a suggestion or press Enter to add.
              </FieldHint>
            </CourseFormField>
          </div>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>Content</SubsectionTitle>
          <FieldHint>
            Structured content for this batch page with H1, H2, and H3 heading support.
          </FieldHint>

          <CourseFormField label="Formatted Content">
            <BlogRichEditor
              value={seo.formattedContent || ''}
              onChange={(html) => updateSeo('formattedContent', html)}
              placeholder="Write batch description with headings, lists, and links…"
              minHeight={220}
            />
            <FieldHint>
              Use the toolbar for H1, H2, H3, bold, lists, links, and images.
            </FieldHint>
          </CourseFormField>
        </div>
      </div>
    </div>
  )
}
