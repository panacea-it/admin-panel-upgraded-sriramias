import SectionBar from './SectionBar'
import {
  CourseFormField,
  CourseInput,
  CourseSelect,
  CourseTextarea,
} from './CourseFormField'
import {
  bulletsToText,
  COURSE_CURRENCIES,
  parsePaymentBullets,
} from '../../utils/feeDetailsForm'

function PaymentBulletPointsBlock({
  label,
  placeholder,
  helperText,
  sampleItems,
  value,
  onChange,
}) {
  const bullets = parsePaymentBullets(value)
  const previewItems = bullets.length ? bullets : sampleItems

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-[#246392]">{label}</label>
      <CourseTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder={placeholder}
        className="min-h-[7.5rem]"
      />
      <p className="text-xs text-[#686868]">{helperText}</p>
      <ul className="mt-1 space-y-1.5 rounded-lg border border-[#eef2fc] bg-[#fafcff] px-4 py-3">
        {previewItems.map((line, idx) => (
          <li
            key={`${line}-${idx}`}
            className={`flex gap-2 text-sm ${
              bullets.length ? 'font-medium text-[#333]' : 'text-[#9ca3af]'
            }`}
          >
            <span className="shrink-0 text-[#55ace7]">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ONLINE_SAMPLES = Array.from({ length: 8 }, (_, i) => `Online payment bullet point ${i + 1}`)
const OFFLINE_SAMPLES = Array.from({ length: 8 }, (_, i) => `Offline payment bullet point ${i + 1}`)

/** Fee Details — Add/Edit Batch */
export default function BatchFeeDetailsSection({ form, setForm }) {
  const fee = form.feeDetails || {}

  const updateFee = (key, value) => {
    setForm((f) => ({
      ...f,
      feeDetails: { ...f.feeDetails, [key]: value },
    }))
  }

  const onlineText =
    fee.onlinePaymentBulletsText ?? bulletsToText(fee.onlinePaymentBullets)
  const offlineText =
    fee.offlinePaymentBulletsText ?? bulletsToText(fee.offlinePaymentBullets)

  return (
    <div className="space-y-4">
      <SectionBar title="Fee Details" />
      <div className="grid gap-4 rounded-xl border border-gray-100 bg-white px-4 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:grid-cols-2 sm:px-6 sm:py-6">
        <CourseFormField label="Currency">
          <CourseSelect
            value={fee.currency || 'INR'}
            onChange={(e) => updateFee('currency', e.target.value)}
          >
            {COURSE_CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </CourseSelect>
        </CourseFormField>

        <CourseFormField label="Discount Fee">
          <CourseInput
            type="number"
            min={0}
            value={fee.discountFee ?? ''}
            onChange={(e) => updateFee('discountFee', e.target.value)}
            placeholder="Optional discounted amount"
          />
        </CourseFormField>

        <CourseFormField label="Online Payment Amount">
          <CourseInput
            type="number"
            min={0}
            value={fee.onlinePaymentAmount ?? ''}
            onChange={(e) => updateFee('onlinePaymentAmount', e.target.value)}
            placeholder="Enter online payment amount"
          />
        </CourseFormField>

        <CourseFormField label="Offline Payment Amount">
          <CourseInput
            type="number"
            min={0}
            value={fee.offlinePaymentAmount ?? ''}
            onChange={(e) => updateFee('offlinePaymentAmount', e.target.value)}
            placeholder="Enter offline payment amount"
          />
        </CourseFormField>

        <div className="sm:col-span-2">
          <PaymentBulletPointsBlock
            label="Online Payment – Bullet Points"
            placeholder="Add bullet points for online payment"
            helperText="Add at least 5 to 8 bullet points"
            sampleItems={ONLINE_SAMPLES}
            value={onlineText}
            onChange={(text) => {
              setForm((f) => ({
                ...f,
                feeDetails: {
                  ...f.feeDetails,
                  onlinePaymentBulletsText: text,
                  onlinePaymentBullets: parsePaymentBullets(text),
                },
              }))
            }}
          />
        </div>

        <div className="sm:col-span-2">
          <PaymentBulletPointsBlock
            label="Offline Payment – Bullet Points"
            placeholder="Add bullet points for offline payment"
            helperText="Add at least 5 to 8 bullet points"
            sampleItems={OFFLINE_SAMPLES}
            value={offlineText}
            onChange={(text) => {
              setForm((f) => ({
                ...f,
                feeDetails: {
                  ...f.feeDetails,
                  offlinePaymentBulletsText: text,
                  offlinePaymentBullets: parsePaymentBullets(text),
                },
              }))
            }}
          />
        </div>
      </div>
    </div>
  )
}
