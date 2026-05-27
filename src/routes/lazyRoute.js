import { createElement, lazy } from 'react'
import { isChunkLoadError } from '../utils/chunkLoadError'

/**
 * Wraps React.lazy so a failed dynamic import shows a recoverable fallback
 * instead of a blank screen. Surfaces the real error in development.
 */
export function lazyRoute(importer, moduleLabel = 'page') {
  return lazy(async () => {
    try {
      return await importer()
    } catch (error) {
      console.error(`[lazyRoute] Failed to load ${moduleLabel}:`, error)

      const { default: LazyLoadErrorPage } = await import('../pages/LazyLoadErrorPage.jsx')

      const isChunk = isChunkLoadError(error)
      const devDetail =
        import.meta.env.DEV && error?.message ? error.message : undefined

      return {
        default: function LazyRouteLoadError() {
          return createElement(LazyLoadErrorPage, {
            moduleLabel,
            isChunkLoadError: isChunk,
            detail: devDetail,
          })
        },
      }
    }
  })
}
