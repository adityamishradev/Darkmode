import { useCallback, useEffect, useRef, useState } from 'react'

export const PRESET_COLORS = [
  { id: 'yellow', hex: '#ffd600' },
  { id: 'green',  hex: '#00c853' },
  { id: 'pink',   hex: '#ff4081' },
  { id: 'blue',   hex: '#2979ff' },
  { id: 'orange', hex: '#ff6d00' },
  { id: 'red',    hex: '#f44336' },
  { id: 'purple', hex: '#aa00ff' },
  { id: 'cyan',   hex: '#00bcd4' },
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
// AnnFloatingToolbar — colour picker + size slider + custom colour
// ─────────────────────────────────────────────────────────────────────────────
export function AnnFloatingToolbar({ position, tool, onApply, onCancel }) {
  const [color,   setColor]   = useState('#ffd600')
  const [size,    setSize]    = useState(2)
  const [opacity, setOpacity] = useState(40)   // % — for highlight thin/dark
  const ref = useRef(null)

  const isHighlight    = tool === 'highlight'
  const isLineTool     = tool === 'underline' || tool === 'strikethrough'
  const isTickTool     = tool === 'tick'

  const tickOptions = [
    { hex: '#00c853', id: 'tick',     label: '✓ Tick'  },
    { hex: '#2979ff', id: 'checkbox', label: '☑ Box'   },
    { hex: '#f44336', id: 'cross',    label: '✕ Cross' },
  ]

  useEffect(() => {
    let handler
    const raf = requestAnimationFrame(() => {
      handler = (e) => {
        if (ref.current && !ref.current.contains(e.target)) onCancel()
      }
      document.addEventListener('mousedown', handler)
    })
    return () => { cancelAnimationFrame(raf); if (handler) document.removeEventListener('mousedown', handler) }
  }, [onCancel])

  if (!position) return null

  const style = {
    position: 'fixed',
    top:  Math.min(position.y, window.innerHeight - 200),
    left: Math.max(8, Math.min(position.x, window.innerWidth - 340)),
    zIndex: 99999,
  }

  return (
    <div ref={ref} className="ann-toolbar ann-toolbar-v2" style={style}
      onMouseDown={(e) => e.stopPropagation()}>

      {/* Header */}
      <div className="ann-tb-header">
        <span className="ann-toolbar-label">{TYPE_LABELS[tool] || tool}</span>
        <button className="ann-cancel-btn"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onCancel() }}>✕</button>
      </div>

      {isTickTool ? (
        <div className="ann-tb-row">
          {tickOptions.map((t) => (
            <button key={t.id}
              className={`ann-tick-opt${color === t.hex ? ' selected' : ''}`}
              style={{ borderColor: t.hex, color: t.hex }}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setColor(t.hex) }}>
              {t.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Preset colour swatches */}
          <div className="ann-tb-row ann-tb-colors">
            {PRESET_COLORS.map((c) => (
              <button key={c.id}
                className={`ann-color-btn${color === c.hex ? ' selected' : ''}`}
                style={{ background: c.hex }}
                title={c.id}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setColor(c.hex) }}
                aria-label={c.id}
              />
            ))}
          </div>

          {/* Custom colour */}
          <div className="ann-tb-row">
            <label className="ann-custom-label">Custom:</label>
            <input type="color" value={color} className="ann-custom-color"
              onChange={(e) => setColor(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()} />
            <span className="ann-hex-val">{color}</span>
          </div>

          {/* Highlight: Thin ↔ Dark opacity slider */}
          {isHighlight && (
            <div className="ann-tb-row ann-tb-opacity-row">
              <span className="ann-opacity-label">Thin</span>
              <input type="range" min="15" max="80" value={opacity}
                className="ann-size-slider"
                onChange={(e) => setOpacity(Number(e.target.value))}
                onMouseDown={(e) => e.stopPropagation()} />
              <span className="ann-opacity-label">Dark</span>
              <span className="ann-hex-val">{opacity}%</span>
            </div>
          )}

          {/* Underline / Strikethrough: size slider */}
          {isLineTool && (
            <div className="ann-tb-row">
              <label className="ann-custom-label">Size: {size}px</label>
              <input type="range" min="1" max="8" value={size}
                className="ann-size-slider"
                onChange={(e) => setSize(Number(e.target.value))}
                onMouseDown={(e) => e.stopPropagation()} />
            </div>
          )}

          {/* Live preview */}
          <div className="ann-tb-preview">
            {isHighlight && (
              <div style={{
                height: 20, background: color,
                opacity: opacity / 100,
                borderRadius: 3, flex: 1,
                border: '1px solid rgba(255,255,255,.1)',
              }} />
            )}
            {tool === 'underline' && (
              <div style={{ height: 1, flex: 1, alignSelf: 'flex-end',
                borderBottom: `${size}px solid ${color}` }} />
            )}
            {tool === 'strikethrough' && (
              <div style={{ height: size, background: color,
                borderRadius: 1, flex: 1, alignSelf: 'center' }} />
            )}
          </div>
        </>
      )}

      <button className="ann-apply-btn ann-apply-full"
        onMouseDown={(e) => {
          e.preventDefault(); e.stopPropagation()
          onApply(color, size, opacity / 100)
        }}>
        Apply
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NotePopup
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
      <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Write your note…"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }} />
      <div className="ann-note-popup-actions">
        <button className="ann-note-delete" onClick={() => { onDelete(annotation.id); onClose() }}>Delete</button>
        <button className="ann-note-save"   onClick={() => { onSave(annotation.id, text); onClose() }}>Save</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnnRect — rendered highlight / underline / strikethrough
// ─────────────────────────────────────────────────────────────────────────────
function AnnRect({ ann, onDelete }) {
  const style = {
    position: 'absolute',
    left: ann.x, top: ann.y, width: ann.width, height: ann.height,
    pointerEvents: 'auto',
    cursor: 'pointer',
    borderRadius: 1,
  }
  if (ann.type === 'highlight') {
    style.background = ann.color || '#ffd600'
    style.opacity = ann.opacity || 0.38
    style.mixBlendMode = 'multiply'
  } else if (ann.type === 'underline') {
    style.background = 'transparent'
    style.borderBottom = `${ann.size || 2}px solid ${ann.color || '#ffd600'}`
    style.opacity = 0.9
  } else if (ann.type === 'strikethrough') {
    style.background = 'transparent'
    style.position = 'absolute'
  }

  return (
    <div className={`ann-rect ann-${ann.type}`} style={style}
      title={`${TYPE_LABELS[ann.type] || ann.type} — hover × to remove`}>
      {ann.type === 'strikethrough' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: ann.size || 2,
          background: ann.color || '#ffd600', transform: 'translateY(-50%)', borderRadius: 1 }} />
      )}
      <button className="ann-delete-btn"
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault() }}
        onClick={(e) => { e.stopPropagation(); onDelete(ann.id) }}
        aria-label="Remove">×</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnnTick
// ─────────────────────────────────────────────────────────────────────────────
function AnnTick({ ann, onDelete, onMove }) {
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const pageEl = e.currentTarget.closest('.pdf-page')
    if (!pageEl) return
    const pr = pageEl.getBoundingClientRect()
    const sx = e.clientX, sy = e.clientY
    const ox = parsePct(ann.x) * pr.width / 100
    const oy = parsePct(ann.y) * pr.height / 100
    const move = (me) => {
      onMove(ann.id,
        `${Math.max(0, Math.min(95, ((ox + me.clientX - sx) / pr.width)  * 100)).toFixed(3)}%`,
        `${Math.max(0, Math.min(95, ((oy + me.clientY - sy) / pr.height) * 100)).toFixed(3)}%`)
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }
  const sym = ann.tickType === 'checkbox' ? '☑' : ann.tickType === 'cross' ? '✕' : '✓'
  return (
    <div className={`ann-tick type-${ann.tickType || 'tick'}`}
      style={{ left: ann.x, top: ann.y }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(ann.id) }}
      title="Drag · Right-click to delete">{sym}</div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnnNote
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
    const ox = parsePct(ann.x) * pr.width / 100
    const oy = parsePct(ann.y) * pr.height / 100
    const move = (me) => {
      onMove(ann.id,
        `${Math.max(0, Math.min(95, ((ox + me.clientX - sx) / pr.width)  * 100)).toFixed(3)}%`,
        `${Math.max(0, Math.min(95, ((oy + me.clientY - sy) / pr.height) * 100)).toFixed(3)}%`)
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }
  return (
    <div className={`ann-note color-${ann.color || 'yellow'}`}
      style={{ left: ann.x, top: ann.y }} onMouseDown={handleMouseDown}>
      <div className="ann-note-icon" title={ann.noteText || 'Click to edit'}
        onClick={(e) => { e.stopPropagation(); setShowPopup((v) => !v) }}>📝</div>
      {showPopup && (
        <NotePopup annotation={ann}
          onSave={(id, t) => onUpdate(id, { noteText: t })}
          onDelete={onDelete} onClose={() => setShowPopup(false)} />
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
  const selRef  = useRef(null)
  const toolRef = useRef(activeTool)
  useEffect(() => { toolRef.current = activeTool }, [activeTool])

  // ── Text selection via document mouseup ───────────────────────────────────
  useEffect(() => {
    if (!pageEl) return

    const onUp = () => {
      const tool = toolRef.current
      if (!tool || tool === 'tick' || tool === 'note' || tool === 'pen' || tool === 'eraser') return

      setTimeout(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) return

        const range = sel.getRangeAt(0)
        // Confirm this selection is inside THIS page element
        if (!pageEl.contains(range.commonAncestorContainer)) return

        const pr    = pageEl.getBoundingClientRect()
        const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1)
        if (!rects.length) return

        const pctRects = rects.map((r) => ({
          x: ((r.left  - pr.left) / pr.width)  * 100,
          y: ((r.top   - pr.top)  / pr.height) * 100,
          w: (r.width             / pr.width)  * 100,
          h: (r.height            / pr.height) * 100,
        }))

        selRef.current = { pctRects, text: sel.toString().trim() }
        setPendingRects(pctRects)

        const last = rects[rects.length - 1]
        setToolbarPos({ x: last.left + last.width / 2 - 160, y: last.bottom + 14 })
      }, 30)
    }

    document.addEventListener('mouseup', onUp)
    return () => document.removeEventListener('mouseup', onUp)
  }, [pageEl])

  // ── Apply ─────────────────────────────────────────────────────────────────
  const handleApply = useCallback((color, size, opacity) => {
    if (!selRef.current) return
    const { pctRects, text } = selRef.current
    pctRects.forEach(({ x, y, w, h }) => {
      onAdd({
        type:    toolRef.current,
        page,    color, text,
        size:    size || 2,
        opacity: toolRef.current === 'highlight' ? (opacity ?? 0.40) : 0.9,
        x:       `${x.toFixed(4)}%`,
        y:       `${y.toFixed(4)}%`,
        width:   `${w.toFixed(4)}%`,
        height:  `${h.toFixed(4)}%`,
      })
    })
    window.getSelection()?.removeAllRanges()
    selRef.current = null
    setPendingRects([])
    setToolbarPos(null)
  }, [onAdd, page])

  const handleCancel = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    selRef.current = null; setPendingRects([]); setToolbarPos(null)
  }, [])

  // ── Tick / note drop ──────────────────────────────────────────────────────
  const handleOverlayClick = useCallback((e) => {
    const tool = toolRef.current
    if (tool !== 'tick' && tool !== 'note') return
    if (!pageEl) return
    e.stopPropagation()
    const pr = pageEl.getBoundingClientRect()
    const x  = ((e.clientX - pr.left) / pr.width)  * 100
    const y  = ((e.clientY - pr.top)  / pr.height) * 100
    if (tool === 'tick') {
      onAdd({ type: 'tick', page, x: `${x.toFixed(3)}%`, y: `${y.toFixed(3)}%`, tickType: 'tick', color: '#00c853' })
    } else {
      onAdd({ type: 'note', page, x: `${x.toFixed(3)}%`, y: `${y.toFixed(3)}%`, color: activeColor || 'yellow', noteText: '' })
    }
  }, [activeColor, onAdd, page, pageEl])

  const handleMove = useCallback((id, xP, yP) => onUpdate(id, { x: xP, y: yP }), [onUpdate])
  const isDropTool = activeTool === 'tick' || activeTool === 'note'

  return (
    <>
      <div className="annotation-overlay"
        style={{ pointerEvents: isDropTool ? 'auto' : 'none', zIndex: isDropTool ? 3 : 2 }}
        onClick={isDropTool ? handleOverlayClick : undefined}>

        {annotations.map((ann) => {
          if (ann.type === 'tick') return <AnnTick key={ann.id} ann={ann} onDelete={onDelete} onMove={handleMove} />
          if (ann.type === 'note') return <AnnNote key={ann.id} ann={ann} onDelete={onDelete} onUpdate={onUpdate} onMove={handleMove} />
          return <AnnRect key={ann.id} ann={ann} onDelete={onDelete} />
        })}

        {/* Live preview */}
        {pendingRects.map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`,
            background: activeTool === 'highlight' ? '#ffd600' : 'transparent',
            borderBottom: activeTool === 'underline' ? '2px solid #ffd600' : 'none',
            opacity: 0.35, pointerEvents: 'none',
          }} />
        ))}
      </div>

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
