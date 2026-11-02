import { useCallback, useEffect, useRef, useState } from 'react'

// ── Colour definitions ─────────────────────────────────────────────────────
export const COLORS = [
  { id: 'yellow', hex: '#ffd600', label: 'Yellow' },
  { id: 'green',  hex: '#00c853', label: 'Green'  },
  { id: 'pink',   hex: '#ff4081', label: 'Pink'   },
  { id: 'blue',   hex: '#2979ff', label: 'Blue'   },
  { id: 'orange', hex: '#ff6d00', label: 'Orange' },
  { id: 'red',    hex: '#f44336', label: 'Red'    },
]

export const TYPE_LABELS = {
  highlight:     'Highlight',
  underline:     'Underline',
  strikethrough: 'Strikethrough',
  tick:          'Tick',
  note:          'Note',
}

const parsePct = (v) => (typeof v === 'string' ? parseFloat(v) : v)

// ─────────────────────────────────────────────────────────────────────────────
// Floating colour-picker toolbar
// ─────────────────────────────────────────────────────────────────────────────
export function AnnFloatingToolbar({ position, tool, onApply, onCancel }) {
  const [selectedColor, setSelectedColor] = useState('yellow')
  const ref = useRef(null)

  const options =
    tool === 'tick'
      ? [
          { id: 'tick',     hex: '#00c853', label: '✓ Tick'  },
          { id: 'checkbox', hex: '#2979ff', label: '☑ Check' },
          { id: 'cross',    hex: '#f44336', label: '✕ Cross' },
        ]
      : COLORS

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCancel()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onCancel])

  if (!position) return null

  return (
    <div
      ref={ref}
      className="ann-toolbar"
      style={{
        position: 'fixed',
        top:  Math.min(position.y, window.innerHeight - 70),
        left: Math.max(8, Math.min(position.x, window.innerWidth - 330)),
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="ann-toolbar-label">{TYPE_LABELS[tool] || tool}</span>
      {options.map((c) => (
        <button
          key={c.id}
          className={`ann-color-btn${selectedColor === c.id ? ' selected' : ''}`}
          style={{ background: c.hex }}
          title={c.label}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColor(c.id) }}
          aria-label={c.label}
        />
      ))}
      <button className="ann-apply-btn"
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onApply(selectedColor) }}>
        Apply
      </button>
      <button className="ann-cancel-btn"
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onCancel() }}>
        ✕
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sticky-note popup
// ─────────────────────────────────────────────────────────────────────────────
function NotePopup({ annotation, onSave, onDelete, onClose }) {
  const [text, setText] = useState(annotation.noteText || '')
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const tid = setTimeout(() => document.addEventListener('mousedown', h), 0)
    return () => { clearTimeout(tid); document.removeEventListener('mousedown', h) }
  }, [onClose])

  return (
    <div className="ann-note-popup" ref={ref}
      onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <textarea
        autoFocus value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note…"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      />
      <div className="ann-note-popup-actions">
        <button className="ann-note-delete" onClick={() => { onDelete(annotation.id); onClose() }}>Delete</button>
        <button className="ann-note-save"   onClick={() => { onSave(annotation.id, text); onClose() }}>Save</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlight / Underline / Strikethrough rect
// ─────────────────────────────────────────────────────────────────────────────
function AnnRect({ ann, onDelete }) {
  return (
    <div
      className={`ann-rect ann-${ann.type} color-${ann.color}`}
      style={{ left: ann.x, top: ann.y, width: ann.width, height: ann.height }}
      title={`${TYPE_LABELS[ann.type] || ann.type} — hover × to remove`}
    >
      <button className="ann-delete-btn"
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault() }}
        onClick={(e)      => { e.stopPropagation(); onDelete(ann.id) }}
        aria-label="Remove annotation">×</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tick / checkbox mark (draggable)
// ─────────────────────────────────────────────────────────────────────────────
function AnnTick({ ann, onDelete, onMove }) {
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const pageEl = e.currentTarget.closest('.pdf-page')
    if (!pageEl) return
    const pr = pageEl.getBoundingClientRect()
    const sx = e.clientX, sy = e.clientY
    const ox = parsePct(ann.x) * pr.width  / 100
    const oy = parsePct(ann.y) * pr.height / 100
    const move = (me) => {
      const nx = Math.max(0, Math.min(95, ((ox + me.clientX - sx) / pr.width)  * 100))
      const ny = Math.max(0, Math.min(95, ((oy + me.clientY - sy) / pr.height) * 100))
      onMove(ann.id, `${nx}%`, `${ny}%`)
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }
  const sym = ann.tickType === 'checkbox' ? '☑' : ann.tickType === 'cross' ? '✕' : '✓'
  return (
    <div className={`ann-tick type-${ann.tickType || 'tick'}`}
      style={{ left: ann.x, top: ann.y }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(ann.id) }}
      title="Drag to move · Right-click to delete">
      {sym}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sticky note (draggable)
// ─────────────────────────────────────────────────────────────────────────────
function AnnNote({ ann, onDelete, onUpdate, onMove }) {
  const [showPopup, setShowPopup] = useState(false)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    if (e.target.closest('.ann-note-icon') || e.target.tagName === 'BUTTON') return
    e.preventDefault(); e.stopPropagation()
    const pageEl = e.currentTarget.closest('.pdf-page')
    if (!pageEl) return
    const pr = pageEl.getBoundingClientRect()
    const sx = e.clientX, sy = e.clientY
    const ox = parsePct(ann.x) * pr.width  / 100
    const oy = parsePct(ann.y) * pr.height / 100
    const move = (me) => {
      const nx = Math.max(0, Math.min(95, ((ox + me.clientX - sx) / pr.width)  * 100))
      const ny = Math.max(0, Math.min(95, ((oy + me.clientY - sy) / pr.height) * 100))
      onMove(ann.id, `${nx}%`, `${ny}%`)
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }
  return (
    <div className={`ann-note color-${ann.color || 'yellow'}`}
      style={{ left: ann.x, top: ann.y }} onMouseDown={handleMouseDown}>
      <div className="ann-note-icon"
        title={ann.noteText || 'Click to edit'}
        onClick={(e) => { e.stopPropagation(); setShowPopup((v) => !v) }}>📝</div>
      {showPopup && (
        <NotePopup annotation={ann}
          onSave={(id, text) => onUpdate(id, { noteText: text })}
          onDelete={onDelete}
          onClose={() => setShowPopup(false)} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AnnotationLayer
// ─────────────────────────────────────────────────────────────────────────────
export default function AnnotationLayer({
  page, pageEl,
  annotations = [],
  activeTool, activeColor,
  onAdd, onDelete, onUpdate,
}) {
  const [pendingRects, setPendingRects] = useState([])
  const [toolbarPos,   setToolbarPos]   = useState(null)
  const selRef     = useRef(null)
  // Keep latest activeTool in a ref so event listeners always see the current value
  const toolRef    = useRef(activeTool)
  useEffect(() => { toolRef.current = activeTool }, [activeTool])

  // ── Text-selection listener ──────────────────────────────────────────────
  // Attached directly to pageEl so it fires even if the overlay has
  // pointer-events:none (which it does for text tools).
  useEffect(() => {
    if (!pageEl) return

    const onMouseUp = () => {
      const tool = toolRef.current
      // Only handle text-selection tools
      if (!tool || tool === 'tick' || tool === 'note' || tool === 'pen' || tool === 'eraser') return

      // Give the browser a tick to finalise the selection
      setTimeout(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) return
        const range = sel.getRangeAt(0)
        if (!pageEl.contains(range.commonAncestorContainer)) return

        const pr    = pageEl.getBoundingClientRect()
        const rects = Array.from(range.getClientRects())
          .filter((r) => r.width > 2 && r.height > 2)
        if (!rects.length) return

        const pctRects = rects.map((r) => ({
          x: ((r.left   - pr.left) / pr.width)  * 100,
          y: ((r.top    - pr.top)  / pr.height) * 100,
          w: (r.width              / pr.width)  * 100,
          h: (r.height             / pr.height) * 100,
        }))

        selRef.current = { pctRects, text: sel.toString().trim() }
        setPendingRects(pctRects)

        const last = rects[rects.length - 1]
        setToolbarPos({
          x: last.left + last.width / 2 - 140,
          y: last.bottom + 10,
        })
      }, 20)
    }

    // Listen on the page element AND on window (so swipe/scroll doesn't miss it)
    pageEl.addEventListener('mouseup', onMouseUp)
    return () => pageEl.removeEventListener('mouseup', onMouseUp)
  }, [pageEl]) // intentionally only pageEl — toolRef always has current value

  // ── Apply annotation ─────────────────────────────────────────────────────
  const handleApply = useCallback((color) => {
    if (!selRef.current) return
    const { pctRects, text } = selRef.current
    pctRects.forEach(({ x, y, w, h }) => {
      onAdd({
        type:   toolRef.current,
        page,   color, text,
        x:      `${x.toFixed(4)}%`,
        y:      `${y.toFixed(4)}%`,
        width:  `${w.toFixed(4)}%`,
        height: `${h.toFixed(4)}%`,
      })
    })
    window.getSelection()?.removeAllRanges()
    selRef.current = null
    setPendingRects([])
    setToolbarPos(null)
  }, [onAdd, page])

  const handleCancel = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    selRef.current = null
    setPendingRects([])
    setToolbarPos(null)
  }, [])

  // ── Tick / note placement on click ───────────────────────────────────────
  const handleOverlayClick = useCallback((e) => {
    const tool = toolRef.current
    if (tool !== 'tick' && tool !== 'note') return
    if (!pageEl) return
    e.stopPropagation()
    const pr  = pageEl.getBoundingClientRect()
    const x   = ((e.clientX - pr.left) / pr.width)  * 100
    const y   = ((e.clientY - pr.top)  / pr.height) * 100
    if (tool === 'tick') {
      const tickType = activeColor || 'tick'
      onAdd({ type: 'tick', page, x: `${x.toFixed(4)}%`, y: `${y.toFixed(4)}%`, tickType, color: tickType })
    } else {
      onAdd({ type: 'note', page, x: `${x.toFixed(4)}%`, y: `${y.toFixed(4)}%`, color: activeColor || 'yellow', noteText: '' })
    }
  }, [activeColor, onAdd, page, pageEl])

  // ── Move callback for tick / note ────────────────────────────────────────
  const handleMove = useCallback((id, xPct, yPct) => {
    onUpdate(id, { x: xPct, y: yPct })
  }, [onUpdate])

  const isDropTool = activeTool === 'tick' || activeTool === 'note'

  return (
    <>
      <div
        className="annotation-overlay"
        // For text tools: keep pointer-events:none so the textLayer stays selectable
        // For drop tools (tick/note): capture clicks
        style={{ pointerEvents: isDropTool ? 'auto' : 'none' }}
        onClick={isDropTool ? handleOverlayClick : undefined}
      >
        {/* Stored annotations */}
        {annotations.map((ann) => {
          if (ann.type === 'tick') return <AnnTick  key={ann.id} ann={ann} onDelete={onDelete} onMove={handleMove} />
          if (ann.type === 'note') return <AnnNote  key={ann.id} ann={ann} onDelete={onDelete} onUpdate={onUpdate} onMove={handleMove} />
          return                          <AnnRect  key={ann.id} ann={ann} onDelete={onDelete} />
        })}

        {/* Live preview while dragging a selection */}
        {pendingRects.map((r, i) => (
          <div key={i}
            className={`ann-rect ann-${activeTool} color-yellow`}
            style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`, opacity: 0.3, pointerEvents: 'none' }}
          />
        ))}
      </div>

      {/* Floating colour picker (fixed position, above everything) */}
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
