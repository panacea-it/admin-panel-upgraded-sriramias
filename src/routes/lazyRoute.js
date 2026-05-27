import { lazy } from 'react'

/**
 * Wraps React.lazy so a failed dynamic import shows a fallback page instead of a blank screen.
 */
export function lazyRoute(importer) {
  return lazy(() =>
    importer().catch((error) => {
      console.error('[lazyRoute] Failed to load module:', error)
      return import('../pages/LazyLoadErrorPage.jsx')
    }),
  )
}
