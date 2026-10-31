import { Bookmark, FileText, PanelLeftClose, Minus, Plus, Maximize2, Square } from 'lucide-react'
import { Document } from 'react-pdf'
import { useState, useRef, useEffect } from 'react'
import PDFThumbnail from './PDFThumbnail'

export default function PDFSidebar({ file, fileUrl, numPages, pageNumber, bookmarks, onSelect, onBookmark, isBookmarked, onClose, readingMode, onReadingMode, scale, onZoom, onFitWidth, onFitPage, theme, onThemeToggle }) {
  // Lazy-load thumbnails: only render pages visible in the thumbnail list
  const [visiblePages, setVisiblePages] = useState(() => new Set([1, 2, 3, 4, 5]))
  const listRef = useRef(null)

  useEffect(() => {
    // Always make sure current page's thumbnail is loaded
    setVisiblePages((prev) => {
      const next = new Set(prev)
      for (let p = Math.max(1, pageNumber - 1); p <= Math.min(numPages, pageNumber + 3); p++) next.add(p)
      return next
    })
  }, [pageNumber, numPages])

  const handleListScroll = () => {
    const list = listRef.current
    if (!list || !numPages) return
    const itemHeight = list.scrollHeight / (numPages || 1)
    const firstVisible = Math.max(1, Math.floor(list.scrollTop / itemHeight) - 1)
    const lastVisible = Math.min(numPages, firstVisible + 8)
    setVisiblePages((prev) => {
      const next = new Set(prev)
      for (let p = firstVisible; p <= lastVisible; p++) next.add(p)
      return next
    })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <div>
          <p className="eyebrow">DOCUMENT</p>
          <h2>{file?.name || 'Untitled document'}</h2>
        </div>
        <button className="icon-button mobile-only" onClick={onClose} aria-label="Close sidebar">
          <PanelLeftClose size={17} />
        </button>
      </div>

      {file && (
        <div className="file-meta">
          <FileText size={15} />
          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          <span className="meta-dot" />
          <span>{numPages} pages</span>
        </div>
      )}

      <div className="sidebar-section pages-section">
        <div className="section-label">
          <span>Pages</span>
          <span>{numPages || '—'}</span>
        </div>
        <div className="thumbnail-list" ref={listRef} onScroll={handleListScroll}>
          {fileUrl && numPages > 0 && (
            <Document file={fileUrl} loading={null} onLoadSuccess={() => {}}>
              {Array.from({ length: numPages }, (_, index) => {
                const page = index + 1
                return visiblePages.has(page) ? (
                  <PDFThumbnail
                    key={page}
                    page={page}
                    selected={pageNumber === page}
                    onSelect={onSelect}
                  />
                ) : (
                  // Placeholder to maintain scroll height
                  <div key={page} className="thumbnail" style={{ minHeight: 110 }} />
                )
              })}
            </Document>
          )}
        </div>
      </div>

      <div className="sidebar-section sidebar-tools">
        <div className="section-label"><span>Reader mode</span></div>
        <div className="sidebar-mode-grid">
          <button className={readingMode === 'original' ? 'selected' : ''} onClick={() => onReadingMode('original')}>Original</button>
          <button className={readingMode === 'sepia' ? 'selected' : ''} onClick={() => onReadingMode('sepia')}>Sepia</button>
          <button className={readingMode === 'night' ? 'selected' : ''} onClick={() => onReadingMode('night')}>Night</button>
        </div>
        <div className="section-label sidebar-zoom-label">
          <span>Zoom</span><span>{Math.round(scale * 100)}%</span>
        </div>
        <div className="sidebar-zoom-row">
          <button className="icon-button" onClick={() => onZoom(-0.1)} aria-label="Zoom out" title="Zoom out"><Minus size={16} /></button>
          <button className="fit-button" onClick={onFitWidth}><Maximize2 size={14} /> Fit width</button>
          <button className="fit-button" onClick={onFitPage}><Square size={13} /> Fit page</button>
          <button className="icon-button" onClick={() => onZoom(0.1)} aria-label="Zoom in" title="Zoom in"><Plus size={16} /></button>
        </div>
        <div className="section-label sidebar-theme-label">
          <span>App theme</span><span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </div>
        <button className="theme-switch-row" onClick={onThemeToggle}>
          <span className={`theme-swatch ${theme}`} />
          <span>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</span>
        </button>
      </div>

      <div className="sidebar-section bookmark-section">
        <div className="section-label">
          <span>Bookmarks</span><span>{bookmarks.length || '—'}</span>
        </div>
        {bookmarks.length
          ? bookmarks.map((page) => (
              <button className="bookmark-row" key={page} onClick={() => onSelect(page)}>
                <Bookmark size={14} fill="currentColor" />
                <span>Page {page}</span>
                <span className="bookmark-page">{page}</span>
              </button>
            ))
          : <p className="empty-state">Save pages for quick access with the bookmark button below.</p>}
      </div>

      <div className="sidebar-footer">
        <span className="status-dot" /> Local document
      </div>
    </aside>
  )
}
