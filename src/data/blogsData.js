const STORAGE_KEY = 'sriram_blogs_v1'

const SAMPLE_TITLE = 'Why Discipline Beats Motivation Every Time ?'

function makeBlog(id, overrides = {}) {
  const publishedAt = overrides.publishedAt || new Date().toISOString()
  return {
    id,
    title: SAMPLE_TITLE,
    status: 'Active',
    backgroundImage: '',
    backgroundImageName: '',
    sections: [{ id: `${id}-s1`, topic: 'Topic 1', image: '', imageName: '', content: '' }],
    publishedAt,
    ...overrides,
  }
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const INITIAL_BLOGS = [
  makeBlog(1),
  makeBlog(2, { publishedAt: daysAgo(1) }),
  makeBlog(3, { publishedAt: daysAgo(3), status: 'In Active' }),
  makeBlog(4),
  makeBlog(5),
]

export function formatBlogDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatBlogTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function isBlogToday(iso) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

export function loadBlogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_BLOGS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BLOGS
  } catch {
    return INITIAL_BLOGS
  }
}

export function saveBlogs(blogs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs))
}

export function createEmptyBlog() {
  const id = Date.now()
  return {
    id,
    title: '',
    status: 'Active',
    backgroundImage: '',
    backgroundImageName: '',
    sections: [{ id: `${id}-s1`, topic: '', image: '', imageName: '', content: '' }],
    publishedAt: new Date().toISOString(),
  }
}

export function createEmptySection(blogId) {
  return {
    id: `${blogId}-s${Date.now()}`,
    topic: '',
    image: '',
    imageName: '',
    content: '',
  }
}
