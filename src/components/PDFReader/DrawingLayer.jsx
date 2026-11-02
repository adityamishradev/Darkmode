import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * DrawingLayer — SVG-based freehand drawing overlay per PDF page.
 * Strokes are stored as SVG path strings in page-relative % coordinates.
 * Works with both mouse and touch (pointer events).
 */
export default function DrawingLayer({
  page,
  pageEl,
  strokes = [],        // [{ id, path, color, size, opacity }]
  activeTool,          // 'pen' | 'eraser' | null
  penColor,
  penSize,
  onAddStroke,
  onDeleteStroke,
}) {
  const svgRef = useRef(null)
  const drawing = useRef(false)
  const currentPath = useRef([])
  const [livePoints, setLivePoints] = useState(null) // current live stroke points

  const isActive = activeTool === 'pen' || activeTool === 'eraser'

  // Convert clientX/Y → page-relative percentage
  const toPagePct = useCallback((clientX, clientY) => {
    if (!pageEl) return { x: 0, y: 0 }
    const r = pageEl.getBoundingClientRect()
    return {
      x: ((clientX - r.left) / r.width) * 100,
      y: ((clientY - r.top) / r.height) * 100,
    }
  }, [pageEl])

  // Build a compact SVG path string from % points
  const buildPath = (pts) => {
    if (!pts.length) return ''
    const [first, ...rest] = pts
    return `M${first.x.toFixed(3)},${first.y.toFixed(3)}` +
      rest.map((p) => `L${p.x.toFixed(3)},${p.y.toFixed(3)}`).join('')
  }

  useEffect(() => {
    if (!pageEl || !isActive) return

    const onPointerDown = (e) => {
      if (activeTool === 'eraser') return // eraser handled on stroke click
      if (e.button !== 0 && e.pointerType !== 'touch') return
      e.preventDefault()
      drawing.current = true
      currentPath.current = []
      const pt = toPagePct(e.clientX, e.clientY)
      currentPath.current.push(pt)
      setLivePoints([pt])
      pageEl.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e) => {
      if (!drawing.current) return
      e.preventDefault()
      const pt = toPagePct(e.clientX, e.clientY)
      currentPath.current.push(pt)
      // Throttle live update to every 2 points for performance
      if (currentPath.current.length % 2 === 0) {
        setLivePoints([...currentPath.current])
      }
    }

    const onPointerUp = (e) => {
      if (!drawing.current) return
      drawing.current = false
      const pts = currentPath.current
      if (pts.length > 1) {
        onAddStroke({
          type: 'drawing',
          page,
          path: buildPath(pts),
          color: penColor || '#4d9cff',
          size: penSize || 3,
          opacity: 0.9,
        })
      }
      currentPath.current = []
      setLivePoints(null)
    }

    pageEl.addEventListener('pointerdown', onPointerDown)
    pageEl.addEventListener('pointermove', onPointerMove)
    pageEl.addEventListener('pointerup', onPointerUp)
    pageEl.addEventListener('pointercancel', onPointerUp)

    return () => {
      pageEl.removeEventListener('pointerdown', onPointerDown)
      pageEl.removeEventListener('pointermove', onPointerMove)
      pageEl.removeEventListener('pointerup', onPointerUp)
      pageEl.removeEventListener('pointercancel', onPointerUp)
    }
  }, [pageEl, isActive, activeTool, toPagePct, onAddStroke, page, penColor, penSize])

  if (!strokes.length && !livePoints && !isActive) return null

  return (
    <svg
      ref={svgRef}
      className="drawing-layer"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: 4,
        cursor: activeTool === 'pen' ? 'crosshair' : activeTool === 'eraser' ? 'cell' : 'default',
        touchAction: isActive ? 'none' : 'auto',
        overflow: 'visible',
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Stored strokes */}
      {strokes.map((stroke) => (
        <path
          key={stroke.id}
          d={stroke.path}
          stroke={stroke.color}
          strokeWidth={stroke.size / 10} // in viewBox units
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={stroke.opacity ?? 0.9}
          style={{ cursor: activeTool === 'eraser' ? 'cell' : 'default', pointerEvents: activeTool === 'eraser' ? 'stroke' : 'none' }}
          onClick={activeTool === 'eraser' ? (e) => { e.stopPropagation(); onDeleteStroke(stroke.id) } : undefined}
        />
      ))}

      {/* Live stroke while drawing */}
      {livePoints && livePoints.length > 1 && (
        <path
          d={buildPath(livePoints)}
          stroke={penColor || '#4d9cff'}
          strokeWidth={(penSize || 3) / 10}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.9}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  )
}
