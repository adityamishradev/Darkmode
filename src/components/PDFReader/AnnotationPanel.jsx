import { useState } from 'react'
import { COLORS, TYPE_LABELS } from './AnnotationLayer'

const COLOR_HEX = Object.fromEntries(COLORS.map((c) => [c.id, c.hex]))
// tick types use their own colours
const TICK_HEX = { tick: '#00c853', checkbox: '#2979ff', cross: '#f44336' }

const DOT_COLOR = (ann) => {
  if (ann.type === 'tick') return TICK_HEX[ann.tickType] || '#00c853'
  if (ann.type === 'note') return COLOR_HEX[ann.color] || '#ffd600'
  return COLOR_HEX[ann.color] || '#ffd600'
}

const SNIPPET = (ann) => {
  if (ann.type === 'note') return ann.noteText || '(empty note)'
  if (ann.type === 'tick') return ann.tickType === 'checkbox' ? '☑ Checkbox' : ann.tickType === 'cross' ? '✕ Cross' : '✓ Tick'
  return ann.text || '(no text)'
}

const ALL_TYPES = ['highlight', 'underline', 'strikethrough', 'tick', 'note']

export default function AnnotationPanel({ allAnnotations, onNavigate, onDelete, onClearAll }) {
  const [filter, setFilter] = useState('all') // 'all' | type string

  const visible = filter === 'all'
    ? allAnnotations
    : allAnnotations.filter((a) => a.type === filter)

  // Group by page for display
  const grouped = visible.reduce((acc, ann) => {
    const p = ann.page
    if (!acc[p]) acc[p] = []
    acc[p].push(ann)
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
      {/* Filter chips */}
      <div className="ann-filter-row">
        <button
          className={`ann-filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >All</button>
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            className={`ann-filter-chip ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(filter === t ? 'all' : t)}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="ann-panel-list">
        {visible.length === 0 && (
          <p className="ann-panel-empty">
            No annotations yet. Select text and use the toolbar tools to add highlights, underlines, or notes.
          </p>
        )}
        {Object.entries(grouped).map(([page, anns]) => (
          <div key={page}>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: 'var(--muted)', padding: '4px 2px 3px', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Page {page}
            </div>
            {anns.map((ann) => (
              <div
                key={ann.id}
                className="ann-panel-item"
                onClick={() => onNavigate(ann)}
              >
                <div
                  className="ann-panel-dot"
                  style={{ background: DOT_COLOR(ann) }}
                />
                <div className="ann-panel-body">
                  <div className="ann-panel-type">{TYPE_LABELS[ann.type] || ann.type}</div>
                  <div className="ann-panel-text" title={SNIPPET(ann)}>{SNIPPET(ann)}</div>
                </div>
                <button
                  className="ann-panel-del"
                  title="Delete annotation"
                  onClick={(e) => { e.stopPropagation(); onDelete(ann.id) }}
                  aria-label="Delete annotation"
                >×</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Clear all */}
      {allAnnotations.length > 0 && (
        <button
          onClick={onClearAll}
          style={{
            marginTop: 4,
            height: 28,
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '.06em',
            background: 'transparent',
            border: '1px solid rgba(248,113,113,.3)',
            borderRadius: 6,
            color: '#f87171',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: '.15s ease',
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(244,67,54,.12)' }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent' }}
        >
          Clear all annotations
        </button>
      )}
    </div>
  )
}
