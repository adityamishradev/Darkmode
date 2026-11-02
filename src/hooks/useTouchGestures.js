import { useEffect, useRef } from 'react'

/**
 * Attaches touch gesture handlers to a scrollable element ref.
 * - Pinch-to-zoom  → calls onZoom(delta)
 * - Swipe left/right → calls onNext / onPrevious  (only when not pinching)
 * - Double-tap      → calls onDoubleTap()
 */
export function useTouchGestures({ elementRef, onZoom, onNext, onPrevious, onDoubleTap }) {
  const state = useRef({
    lastDist: null,
    lastTap: 0,
    touchStartX: null,
    touchStartY: null,
    isPinching: false,
  })

  useEffect(() => {
    const el = elementRef?.current
    if (!el) return

    const getDistance = (t) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

    const onTouchStart = (e) => {
      const s = state.current
      if (e.touches.length === 2) {
        s.lastDist = getDistance(e.touches)
        s.isPinching = true
      } else if (e.touches.length === 1) {
        s.touchStartX = e.touches[0].clientX
        s.touchStartY = e.touches[0].clientY
        s.isPinching = false

        // Double-tap detection
        const now = Date.now()
        if (now - s.lastTap < 300) {
          e.preventDefault()
          onDoubleTap?.()
        }
        s.lastTap = now
      }
    }

    const onTouchMove = (e) => {
      const s = state.current
      if (e.touches.length === 2 && s.lastDist !== null) {
        e.preventDefault() // prevent browser zoom
        const newDist = getDistance(e.touches)
        const delta = (newDist - s.lastDist) * 0.006 // sensitivity
        if (Math.abs(delta) > 0.005) {
          onZoom?.(delta)
        }
        s.lastDist = newDist
        s.isPinching = true
      }
    }

    const onTouchEnd = (e) => {
      const s = state.current
      if (e.changedTouches.length === 1 && !s.isPinching && s.touchStartX !== null) {
        const dx = e.changedTouches[0].clientX - s.touchStartX
        const dy = Math.abs(e.changedTouches[0].clientY - s.touchStartY)
        // Horizontal swipe: at least 60px, more horizontal than vertical
        if (Math.abs(dx) > 60 && Math.abs(dx) > dy * 1.5) {
          if (dx < 0) onNext?.()
          else onPrevious?.()
        }
      }
      if (e.touches.length === 0) {
        s.lastDist = null
        s.isPinching = false
        s.touchStartX = null
        s.touchStartY = null
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [elementRef, onZoom, onNext, onPrevious, onDoubleTap])
}
