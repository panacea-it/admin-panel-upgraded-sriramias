/** Default empty feature card for admin repeater */
export function emptyWhyChooseFeature(order = 1) {
  return {
    id: `wcf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    icon: '',
    iconPreview: '',
    iconFileName: '',
    title: '',
    description: '',
    isHighlighted: false,
    order,
  }
}

/** Migrate legacy whyChoose slots → whyChooseFeatures */
export function normalizeWhyChooseFeatures(form) {
  if (form?.whyChooseFeatures?.length) {
    return form.whyChooseFeatures.map((f, i) => ({
      id: f.id || `wcf-${i}`,
      icon: f.icon || f.iconPreview || '',
      iconPreview: f.iconPreview || f.icon || '',
      iconFileName: f.iconFileName || '',
      title: f.title || '',
      description: f.description || '',
      isHighlighted: Boolean(f.isHighlighted),
      order: Number(f.order) || i + 1,
    }))
  }
  if (form?.whyChoose?.length) {
    return form.whyChoose.map((slot, i) => ({
      id: slot.id || `wcf-${i}`,
      icon: '',
      iconPreview: '',
      iconFileName: slot.fileName || '',
      title: '',
      description: '',
      isHighlighted: i === 0,
      order: i + 1,
    }))
  }
  return [emptyWhyChooseFeature(1)]
}

/** Sorted cards for student website rendering */
export function mapWhyChooseFeaturesForWebsite(formData) {
  const features = normalizeWhyChooseFeatures(formData || {})
  return [...features]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({
      icon: f.icon || f.iconPreview,
      title: f.title,
      description: f.description,
      isHighlighted: f.isHighlighted,
      order: f.order,
    }))
}
