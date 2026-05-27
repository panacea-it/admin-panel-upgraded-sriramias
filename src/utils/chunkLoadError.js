/** Detect Vite / browser failures when a code-split chunk cannot be fetched. */
export function isChunkLoadError(error) {
  const msg = error?.message ?? String(error ?? '')
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Failed to load module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('ChunkLoadError')
  )
}
