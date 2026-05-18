export const BANNER_CATEGORIES = [
  'GS Foundation',
  'Mentorship Course',
  'Optional Foundation',
  'Test Series',
  'Enrichment Courses',
]

export const BANNER_CENTERS = ['New Delhi', 'Hyderabad', 'Pune']

const COURSE_NAMES = [
  '2 Year General Studies Foundation Course',
  'STRIDE Mentorship Program',
  'Anthropology Optional Foundation Course',
  'CSAT Foundation Course',
  'Geography Optional Foundation Course',
  'Ethics & Integrity Module',
  'History Optional Foundation Course',
  'Public Administration Optional',
  'Prelims Test Series 2026',
  'Mains Answer Writing Program',
  'Current Affairs Enrichment Batch',
  'Essay Writing Workshop',
  'Science & Tech Module',
  'Polity Foundation Course',
  'Economy for UPSC Foundation',
  'Environment & Ecology Crash Course',
  'International Relations Module',
  'Ethics Case Studies Batch',
  'Interview Guidance Program',
  'Delhi Weekend GS Batch',
  'Hyderabad Foundation Weekend',
  'Pune Mentorship Cohort',
  'Law Optional Foundation',
  'Philosophy Optional Batch',
  'Sociology Optional Foundation',
]

export const INITIAL_BANNERS = COURSE_NAMES.map((course, index) => ({
  id: 54546 + index,
  course,
  category: BANNER_CATEGORIES[index % BANNER_CATEGORIES.length],
  center: BANNER_CENTERS[index % BANNER_CENTERS.length],
  status: index % 7 === 0 ? 'In Active' : 'Active',
  hasThumbnail: index % 4 !== 2,
}))
