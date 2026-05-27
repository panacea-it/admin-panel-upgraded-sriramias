import { useMemo } from 'react'
import { useCenters } from '../../contexts/CentersContext'
import SearchableSelect from '../categories/SearchableSelect'
import { CourseFormField } from '../courses/CourseFormField'

export default function CenterDropdown({
  value,
  onChange,
  error,
  label = 'Select Centre',
  required = true,
  disabled = false,
  className,
}) {
  const { activeCenters } = useCenters()

  const options = useMemo(
    () =>
      activeCenters.map((c) => ({
        value: String(c.centerId),
        label: c.centerName,
      })),
    [activeCenters],
  )

  return (
    <CourseFormField label={label} required={required} className={className}>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select centre"
        emptyMessage="No centres available — add one in Centre Management"
        disabled={disabled}
        error={error}
      />
      {error && typeof error === 'string' && (
        <p className="text-xs font-medium text-[#dc2626]">{error}</p>
      )}
    </CourseFormField>
  )
}
