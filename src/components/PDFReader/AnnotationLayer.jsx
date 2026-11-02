import { useCallback, useEffect, useRef, useState } from 'react'

// ── Colour definitions ────────────────────────────────────────────────────────
export const COLORS = [
  { id: 'yellow', hex: '#ffd600', label: 'Yellow' },
  { id: 'green',  hex: '#00c853', label: 'Green' },
  { id: 'pink',   hex: '#ff4081', label: 'Pink' },
  { id: 'blue',   hex: '#2979ff', label: 'Blue' },
  { id: 'orange', hex: '#ff6d00', label: 'Orange' },
  { id: 'red',    hex: '#f44336', label: 'Red' },
]

// ── Type labels ───────────────────────────────────────────────────────────────
export const TYPE_LABELS = {
  highlight: 'Highlight',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  tick: 'Tick',
  note: 'Note',
}

// ── Floating colour-picker toolbar ───────────────────────────────────────────
export function AnnFloatingToolbar({ position, tool, onApply, onCancel }) {
  const [selectedColor, setSelectedColor] = useState('yellow')
  const colorsForTool = tool === 'tick'
    ? [
        { id: 'tick',     hex: '#00c853', label: '✓' },
        { id: 'checkbox', hex: '#2979ff', label: '☑' },
        { id: 'cross',    hex: '#f44336', label: '✕' },
      ]
    : COLORS

  if (!position) return null
  const style = {
    top: position.y,
    left: Math.min(position.x, window.innerWidth - 300),
  }

  return (
    <div className="ann-toolbar" style={style}>
      <span className="ann-toolbar-label">{TYPE_LABELS[tool] || tool}</span>
      {colorsForTool.map((c) => (
        <button
          key={c.id}
          className={`ann-color-btn ${selectedColor === c.id ? 'selected' : ''}`}
          style={{ background: c.hex }}
          title={c.label}
          onClick={() => setSelectedColor(c.id)}
          aria-label={c.label}
        />
      ))}
      <button className="ann-apply-btn" onClick={() => onApply(selectedColor)}>Apply</button>
      <button className="ann-cancel-btn" onClick={onCancel}>✕</button>
    </div>
  )
}

// ── Sticky note popup ─────────────────────────────────────────────────────────
function NotePopup({ annotation, onSave, onDelete, onClose }) {
  const [text, setText] = useState(annotation.noteText || '')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="ann-note-popup" ref={ref} onClick={(e) => e.stopPropagation()}>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note…"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      />
      <div className="ann-note-popup-actions">
        <button className="ann-note-delete" onClick={() => { onDelete(annotation.id); onClose() }}>Delete</button>
        <button className="ann-note-save" onClick={() => { onSave(annotation.id, text); onClose() }}>Save</button>
      </div>
    </div>
  )
}

// ── Single annotation rect (highlight / underline / strikethrough) ────────────
function AnnRect({ ann, onDelete }) {
  return (
    <div
      className={`ann-rect ann-${ann.type} color-${ann.color}`}
      style={{ left: ann.x, top: ann.y, width: ann.width, height: ann.height }}
      title={`${TYPE_LABELS[ann.type]} — click × to remove`}
    >
      <button
        className="ann-delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete(ann.id) }}
        title="Remove annotation"
        aria-label="Remove annotation"
      >×</button>
    </div>
  )
}

// ── Tick / checkbox mark ──────────────────────────────────────────────────────
function AnnTick({ ann, onDelete, onMove }) {
  const dragStart = useRef(null)

  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    const startX = e.clientX - ann.x
    const startY = e.clientY - ann.y
    dragStart.current = { startX, startY }

    const move = (me) => {
      onMove(ann.id, me.clientX - dragStart.current.startX, me.clientY - dragStart.current.startY)
    }
    const up = () => {
      dragStart.current = null
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const symbol = ann.tickType === 'checkbox' ? '☑' : ann.tickType === 'cross' ? '✕' : '✓'
  return (
    <div
      className={`ann-tick type-${ann.tickType || 'tick'}`}
      style={{ left: ann.x, top: ann.y }}
      onMouseDown={handleMouseDown}
      title="Drag to move · Right-click to delete"
      onContextMenu={(e) => { e.preventDefault(); onDelete(ann.id) }}
    >
      {symbol}
    </div>
  )
}

// ── Sticky note ───────────────────────────────────────────────────────────────
function AnnNote({ ann, onDelete, onUpdate, onMove }) {
  const [showPopup, setShowPopup] = useState(false)
  const color = ann.color || 'yellow'

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.tagName === 'BUTTON') return
    e.preventDefault()
    const startX = e.clientX - ann.x
    const startY = e.clientY - ann.y

    const move = (me) => onMove(ann.id, me.clientX - startX, me.clientY - startY)
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <div
      className={`ann-note color-${color}`}
      style={{ left: ann.x, top: ann.y }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="ann-note-icon"
        title={ann.noteText || 'Click to edit note'}
        onClick={() => setShowPopup((v) => !v)}
      >
        📝
      </div>
      {showPopup && (
        <NotePopup
          annotation={ann}
          onSave={(id, text) => onUpdate(id, { noteText: text })}
          onDelete={onDelete}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  )
}

// ── Main AnnotationLayer component ────────────────────────────────────────────
export default function AnnotationLayer({
  page,
  pageRef,
  annotations = [],
  activeTool,
  activeColor,
  onAdd,
  onDelete,
  onUpdate,
  scale,
}) {
  const overlayRef = useRef(null)
  const [pendingRects, setPendingRects] = useState([]) // rects from current selection
  const [toolbarPos, setToolbarPos] = useState(null)
  const selectionRef = useRef(null)

  // ── Handle text selection → show floating toolbar ─────────────────────────
  const handleMouseUp = useCallback(() => {
    if (!activeTool || activeTool === 'tick' || activeTool === 'note') return
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const range = selection.getRangeAt(0)
    const pageEl = pageRef?.current
    if (!pageEl) return

    // Check if selection is inside this page
    if (!pageEl.contains(range.commonAncestorContainer)) return

    const pageRect = pageEl.getBoundingClientRect()
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1)
    if (!rects.length) return

    // Convert to page-relative % coordinates (scale-independent)
    const pageRelRects = rects.map((r) => ({
      x: ((r.left - pageRect.left) / pageRect.width) * 100,
      y: ((r.top - pageRect.top) / pageRect.height) * 100,
      width: (r.width / pageRect.width) * 100,
      height: (r.height / pageRect.height) * 100,
    }))

    selectionRef.current = { rects: pageRelRects, text: selection.toString() }
    setPendingRects(pageRelRects)

    // Position toolbar just below the last rect
    const lastRect = rects[rects.length - 1]
    setToolbarPos({
      x: lastRect.left + lastRect.width / 2 - 120,
      y: lastRect.bottom + 8,
    })
  }, [activeTool, pageRef])

  // ── Apply annotation after colour selection ───────────────────────────────
  const handleApply = useCallback((color) => {
    if (!selectionRef.current) return
    const { rects, text } = selectionRef.current

    rects.forEach((rect) => {
      onAdd({
        type: activeTool, // 'highlight' | 'underline' | 'strikethrough'
        page,
        color,
        text,
        x: `${rect.x}%`,
        y: `${rect.y}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
      })
    })

    window.getSelection()?.removeAllRanges()
    selectionRef.current = null
    setPendingRects([])
    setToolbarPos(null)
  }, [activeTool, onAdd, page])

  const handleCancel = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    selectionRef.current = null
    setPendingRects([])
    setToolbarPos(null)
  }, [])

  // ── Handle tick/note click placement ─────────────────────────────────────
  const handleOverlayClick = useCallback((e) => {
    if (activeTool !== 'tick' && activeTool !== 'note') return
    const pageEl = pageRef?.current
    if (!pageEl) return
    const pageRect = pageEl.getBoundingClientRect()
    // page-relative %
    const x = ((e.clientX - pageRect.left) / pageRect.width) * 100
    const y = ((e.clientY - pageRect.top) / pageRect.height) * 100

    if (activeTool === 'tick') {
      onAdd({ type: 'tick', page, x: `${x}%`, y: `${y}%`, tickType: activeColor || 'tick', color: activeColor || 'green' })
    } else if (activeTool === 'note') {
      onAdd({ type: 'note', page, x: `${x}%`, y: `${y}%`, color: activeColor || 'yellow', noteText: '' })
    }
  }, [activeTool, activeColor, onAdd, page, pageRef])

  // ── Move tick/note ────────────────────────────────────────────────────────
  const handleMove = useCallback((id, clientX, clientY) => {
    const pageEl = pageRef?.current
    if (!pageEl) return
    const pageRect = pageEl.getBoundingClientRect()
    const x = Math.max(0, Math.min(95, ((clientX - pageRect.left) / pageRect.width) * 100))
    const y = Math.max(0, Math.min(95, ((clientY - pageRect.top) / pageRect.height) * 100))
    onUpdate(id, { x: `${x}%`, y: `${y}%` })
  }, [onUpdate, pageRef])

  const isTextTool = activeTool && activeTool !== 'tick' && activeTool !== 'note'

  return (
    <>
      <div
        ref={overlayRef}
        className="annotation-overlay"
        style={{ pointerEvents: (activeTool === 'tick' || activeTool === 'note') ? 'auto' : 'none' }}
        onClick={handleOverlayClick}
        onMouseUp={isTextTool ? handleMouseUp : undefined}
      >
        {/* Render stored annotations */}
        {annotations.map((ann) => {
          if (ann.type === 'tick') {
            return <AnnTick key={ann.id} ann={ann} onDelete={onDelete} onMove={handleMove} />
          }
          if (ann.type === 'note') {
            return <AnnNote key={ann.id} ann={ann} onDelete={onDelete} onUpdate={onUpdate} onMove={handleMove} />
          }
          return <AnnRect key={ann.id} ann={ann} onDelete={onDelete} />
        })}

        {/* Preview rects while selecting */}
        {pendingRects.map((r, i) => (
          <div
            key={i}
            className={`ann-rect ann-${activeTool} color-yellow`}
            style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%`, opacity: 0.28 }}
          />
        ))}
      </div>

      {/* Floating toolbar rendered in a portal-like fixed position */}
      {toolbarPos && (
        <AnnFloatingToolbar
          position={toolbarPos}
          tool={activeTool}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
