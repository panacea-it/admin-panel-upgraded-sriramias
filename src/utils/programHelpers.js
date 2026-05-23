/** Resolve centre display names from IDs */
export function getCentreNames(centresCatalog, centerIds = []) {
  if (!centerIds?.length) return []
  const map = new Map(centresCatalog.map((c) => [String(c.centerId), c.centerName]))
  return centerIds.map((id) => map.get(String(id)) || 'Unknown').filter(Boolean)
}

export function formatCentreNamesLabel(centresCatalog, centerIds = []) {
  const names = getCentreNames(centresCatalog, centerIds)
  if (!names.length) return '—'
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
}

/** Rough stats for program view */
export function getProgramStats(linkedCourses = []) {
  const subjects = new Set()
  linkedCourses.forEach((c) => {
    if (c.examCategory) subjects.add(c.examCategory)
    if (c.examSubcategory) subjects.add(`${c.examCategory}-${c.examSubcategory}`)
  })
  return {
    totalCourses: linkedCourses.length,
    totalSubjects: Math.max(subjects.size, linkedCourses.length > 0 ? 3 : 0),
    totalTopics: linkedCourses.length > 0 ? linkedCourses.length * 4 : 0,
  }
}
