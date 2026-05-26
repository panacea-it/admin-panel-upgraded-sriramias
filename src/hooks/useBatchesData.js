import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCourses } from '../api/coursesAPI'
import {
  enrichBatchRow,
  mapInitialBatchesToRows,
} from '../utils/batchHelpers'

export function useBatchesData() {
  const [apiBatches, setApiBatches] = useState([])
  const [loading, setLoading] = useState(true)

  const loadBatches = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await fetchCourses()
      setApiBatches(rows.map((row, i) => enrichBatchRow(row, i)))
    } catch {
      setApiBatches(mapInitialBatchesToRows().map((row, i) => enrichBatchRow(row, i)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  const sourceRows = useMemo(() => {
    if (apiBatches.length > 0) return apiBatches
    return mapInitialBatchesToRows()
  }, [apiBatches])

  const existingCourseIds = useMemo(
    () => apiBatches.map((b) => b.courseId).filter(Boolean),
    [apiBatches],
  )

  return {
    apiBatches,
    sourceRows,
    loading,
    loadBatches,
    existingCourseIds,
  }
}

export function findBatchRow(rows, batchIdParam) {
  if (!batchIdParam) return null
  const decoded = decodeURIComponent(String(batchIdParam))
  return (
    rows.find(
      (r) =>
        String(r.id) === decoded ||
        String(r.batchId) === decoded,
    ) ?? null
  )
}
