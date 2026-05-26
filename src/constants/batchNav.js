export const BATCHES_BASE = '/academics/batch'

export function batchDetailsPath(batchId) {
  return `${BATCHES_BASE}/${encodeURIComponent(String(batchId))}`
}
