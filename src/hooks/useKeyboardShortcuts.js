import { useEffect } from 'react'

export function useKeyboardShortcuts({ onPrevious, onNext, onZoomIn, onZoomOut, onSearch, onFullscreen, onFirst, onLast, onEscape }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      if (event.key === 'Escape') onEscape?.()
      if (typing) return
      if (event.metaKey || event.ctrlKey) {
        if (event.key.toLowerCase() === 'f') { event.preventDefault(); onSearch?.() }
        return
      }
      if (event.key === 'ArrowLeft') onPrevious?.()
      if (event.key === 'ArrowRight') onNext?.()
      if (event.key === '+' || event.key === '=') onZoomIn?.()
      if (event.key === '-') onZoomOut?.()
      if (event.key.toLowerCase() === 'f') onFullscreen?.()
      if (event.key === 'Home') onFirst?.()
      if (event.key === 'End') onLast?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPrevious, onNext, onZoomIn, onZoomOut, onSearch, onFullscreen, onFirst, onLast, onEscape])
}
