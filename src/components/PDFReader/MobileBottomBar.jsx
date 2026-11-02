import {
  ChevronLeft, ChevronRight, Highlighter, Underline,
  Strikethrough, CheckSquare, StickyNote, Pen, Eraser,
  Undo2, Redo2, X, Bookmark, Search,
} from 'lucide-react'

const TOOLS = [
  { id: 'highlight',     icon: Highlighter,   label: 'Highlight' },
  { id: 'underline',     icon: Underline,     label: 'Underline' },
  { id: 'strikethrough', icon: Strikethrough, label: 'Strike' },
  { id: 'pen',           icon: Pen,           label: 'Draw' },
  { id: 'eraser',        icon: Eraser,        label: 'Erase' },
  { id: 'tick',          icon: CheckSquare,   label: 'Tick' },
  { id: 'note',          icon: StickyNote,    label: 'Note' },
]

export default function MobileBottomBar({
  pageNumber, numPages, onPrevious, onNext,
  activeTool, onToolChange,
  onUndo, onRedo, canUndo, canRedo,
  onBookmark, bookmarked,
  onSearch,
  file,
}) {
  const toggle = (id) => onToolChange?.(activeTool === id ? null : id)

  return (
    <div className="mobile-bottom-bar">
      {/* ── Nav row ── */}
      <div className="mbb-nav">
        <button className="mbb-btn" onClick={onPrevious} disabled={pageNumber <= 1} aria-label="Previous page">
          <ChevronLeft size={20} />
        </button>
        <span className="mbb-page">{pageNumber} / {numPages || '--'}</span>
        <button className="mbb-btn" onClick={onNext} disabled={!numPages || pageNumber >= numPages} aria-label="Next page">
          <ChevronRight size={20} />
        </button>

        <div className="mbb-divider" />

        <button className="mbb-btn" onClick={onSearch} disabled={!file} aria-label="Search">
          <Search size={18} />
        </button>
        <button className={`mbb-btn ${bookmarked ? 'mbb-bookmarked' : ''}`} onClick={onBookmark} disabled={!file} aria-label="Bookmark">
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button className="mbb-btn" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
          <Undo2 size={18} />
        </button>
        <button className="mbb-btn" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
          <Redo2 size={18} />
        </button>
      </div>

      {/* ── Tools row (horizontal scroll) ── */}
      {file && (
        <div className="mbb-tools-row">
          {activeTool && (
            <button className="mbb-tool-btn mbb-tool-cancel" onClick={() => onToolChange(null)} aria-label="Cancel tool">
              <X size={15} />
            </button>
          )}
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`mbb-tool-btn ${activeTool === id ? 'mbb-tool-active' : ''}`}
              onClick={() => toggle(id)}
              aria-label={label}
              title={label}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
