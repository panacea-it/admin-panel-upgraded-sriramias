import api from './axiosInstance'
import { mapCourseFromApi } from '../utils/coursesApiMappers'

function unwrapList(response) {
  const body = response.data
  const list = Array.isArray(body) ? body : body?.data ?? []
  return list.map(mapCourseFromApi).filter(Boolean)
}

function unwrapOne(response) {
  const body = response.data
  const doc = body?.data ?? body
  return mapCourseFromApi(doc)
}

/**
 * @param {{ search?: string, category?: string, status?: string }} params
 */
export async function fetchCourses(params = {}) {
  const query = {}
  if (params.search?.trim()) query.search = params.search.trim()
  if (params.category && params.category !== 'all') query.category = params.category
  if (params.status && params.status !== 'all') query.status = params.status

  const response = await api.get('/courses', { params: query })
  return unwrapList(response)
}

export async function fetchCourseById(id) {
  const response = await api.get(`/courses/${id}`)
  return unwrapOne(response)
}

export async function createCourse(payload) {
  const response = await api.post('/courses', payload)
  return unwrapOne(response)
}

export async function updateCourse(id, payload) {
  const response = await api.put(`/courses/${id}`, payload)
  return unwrapOne(response)
}

export async function deleteCourse(id) {
  await api.delete(`/courses/${id}`)
}
