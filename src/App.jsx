import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, Keyboard, PanelLeftOpen, X } from 'lucide-react'
import UploadArea from './components/UploadArea'
import PDFControls from './components/PDFReader/PDFControls'
import PDFSearch from './components/PDFReader/PDFSearch'
import PDFSidebar from './components/PDFReader/PDFSidebar'
import PDFToolbar from './components/PDFReader/PDFToolbar'
import PDFViewer from './components/PDFReader/PDFViewer'
import MobileBottomBar from './components/PDFReader/MobileBottomBar'
import PPTXViewer from './components/PPTXViewer'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { usePDFReader } from './hooks/usePDFReader'
import { useTheme } from './hooks/useTheme'
import { usePWA } from './hooks/usePWA'
import { useRecentFiles } from './hooks/useRecentFiles'
import { useAnnotations } from './hooks/useAnnotations'
import { useTouchGestures } from './hooks/useTouchGestures'
import PWAStatus from './components/PWAStatus'
import RefreshButton from './components/RefreshButton'

function App() {
  const reader = usePDFReader()
  const { theme, setTheme } = useTheme()
  const { canInstall, install, isOnline } = usePWA()
  const { recentFiles, addRecentFile, deleteRecentFile, renameRecentFile } = useRecentFiles()

  // ── Annotations ───────────────────────────────────────────────────────────
  const {
    annotations, allAnnotations,
    addAnnotation, updateAnnotation, deleteAnnotation,
    undo, redo, clearAll, canUndo, canRedo,
  } = useAnnotations(reader.file)

  const [activeTool, setActiveTool] = useState(null)
  const [activeColor, setActiveColor] = useState('yellow')
  const [penColor, setPenColor] = useState('#4d9cff')
  const [penSize, setPenSize] = useState(3)

  useEffect(() => { if (!reader.file) setActiveTool(null) }, [reader.file])

  // Drawing strokes go into the same annotations store with type:'drawing'
  const addStroke = useCallback((stroke) => addAnnotation(stroke), [addAnnotation])
  const deleteStroke = useCallback((id) => deleteAnnotation(id), [deleteAnnotation])

  // ── UI state ──────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const fileInputRef = useRef(null)
  const openFileRef = useRef(null)
  const setErrorRef = useRef(reader.setError)
  setErrorRef.current = reader.setError

  const openPicker = () => fileInputRef.current?.click()
  const handleOpenFile = useCallback((file) => {
    if (file) addRecentFile(file)
    reader.openFile(file)
  }, [reader, addRecentFile])
  openFileRef.current = handleOpenFile

  // ── Navigation ────────────────────────────────────────────────────────────
  const previous = useCallback(() => reader.setPageNumber(reader.pageNumber - 1), [reader])
  const next     = useCallback(() => reader.setPageNumber(reader.pageNumber + 1), [reader])
  const first    = useCallback(() => reader.setPageNumber(1), [reader])
  const last     = useCallback(() => reader.setPageNumber(reader.numPages), [reader])
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }, [])

  // ── Touch gestures ────────────────────────────────────────────────────────
  useTouchGestures({
    elementRef: reader.viewerRef,
    onZoom: reader.changeZoom,
    onNext: next,
    onPrevious: previous,
    onDoubleTap: () => {
      // Double-tap toggles between fit-width and 150%
      if (reader.scale > 1.2) reader.fitWidth()
      else reader.changeZoom(0.5)
    },
  })

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboardShortcuts({
    onPrevious: previous, onNext: next,
    onZoomIn: () => reader.changeZoom(0.1),
    onZoomOut: () => reader.changeZoom(-0.1),
    onSearch: () => setSearchOpen(true),
    onFullscreen: toggleFullscreen,
    onFirst: first, onLast: last,
    onEscape: () => { setSearchOpen(false); setActiveTool(null); document.exitFullscreen?.() },
  })

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (!reader.file) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const map = { h: 'highlight', u: 'underline', s: 'strikethrough', t: 'tick', n: 'note', p: 'pen', e: 'eraser' }
      const tool = map[e.key.toLowerCase()]
      if (tool) setActiveTool((cur) => cur === tool ? null : tool)
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [undo, redo, reader.file])

  useEffect(() => {
    const h = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  useEffect(() => {
    document.querySelectorAll('.textLayer span').forEach((s) => {
      s.style.backgroundColor = searchQuery && s.textContent?.toLowerCase().includes(searchQuery.toLowerCase())
        ? 'rgba(255,203,72,.55)' : ''
    })
  }, [searchQuery, reader.numPages])

  useEffect(() => {
    if (!('launchQueue' in window)) return undefined
    window.launchQueue.setConsumer(async (lp) => {
      const fh = lp.files?.find((h) => /\.(pdf|pptx)$/i.test(h.name || ''))
      if (!fh) return
      try { openFileRef.current(await fh.getFile()) }
      catch (err) { setErrorRef.current(err?.message || 'Could not open file.') }
    })
    return () => window.launchQueue.setConsumer(() => {})
  }, [])

  const download = () => { const a = document.createElement('a'); a.href = reader.fileUrl; a.download = reader.file?.name || 'document.pdf'; a.click() }
  const print = () => { const f = document.createElement('iframe'); f.style.display='none'; f.src=reader.fileUrl; document.body.appendChild(f); f.onload=()=>f.contentWindow.print() }

  const isPptx = reader.fileType === 'pptx'
  const handleAnnotationNavigate = useCallback((ann) => reader.setPageNumber(ann.page), [reader])

  // ── Upload screen ─────────────────────────────────────────────────────────
  if (!reader.fileUrl) {
    return (
      <div className="app-shell">
        <header className="toolbar">
          <div className="brand"><div className="brand-mark">P</div><span>PDF Reader</span></div>
          <PWAStatus canInstall={canInstall} onInstall={install} isOnline={isOnline} />
          <RefreshButton />
          <button className="shortcut-hint" onClick={() => setShowShortcuts(true)}><Keyboard size={15} /> Shortcuts</button>
        </header>
        <UploadArea onOpen={handleOpenFile} error={reader.error} isLoading={reader.isLoading} recentFiles={recentFiles} onDeleteRecent={deleteRecentFile} onRenameRecent={renameRecentFile} />
        <footer className="app-footer">
          <div className="footer-brand"><span className="footer-mark">P</span><strong>PDF Reader</strong></div>
          <span className="footer-copy">Private, local-first document reading</span>
          <div className="footer-meta">
            <span><i className="footer-dot" /> 500 MB max</span>
            <span><i className="footer-dot" /> Works offline</span>
            <span>Built for the web</span>
          </div>
        </footer>
        {showShortcuts && <Shortcuts onClose={() => setShowShortcuts(false)} />}
      </div>
    )
  }

  // ── Reader screen ─────────────────────────────────────────────────────────
  return (
    <div className={`app-shell${fullscreen ? ' is-fullscreen' : ''}`}>
      <PDFToolbar
        file={reader.file} pageNumber={reader.pageNumber} numPages={reader.numPages} scale={reader.scale}
        onOpen={openPicker} onSearch={() => setSearchOpen(true)} onZoom={reader.changeZoom}
        onRotate={() => reader.setRotation((reader.rotation + 90) % 360)}
        onFullscreen={toggleFullscreen} theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onDownload={download} onPrint={print} onMore={() => setShowShortcuts(true)}
        canInstall={canInstall} onInstall={install} isOnline={isOnline}
        sidebarOpen={!isPptx && sidebarOpen} onSidebar={() => setSidebarOpen((o) => !o)}
        activeTool={isPptx ? null : activeTool} onToolChange={setActiveTool}
        onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}
      />

      <input ref={fileInputRef} hidden type="file"
        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx"
        onChange={(e) => handleOpenFile(e.target.files?.[0])} />

      {searchOpen && !isPptx && (
        <PDFSearch onClose={() => { setSearchOpen(false); setSearchQuery('') }} onFind={setSearchQuery} />
      )}

      <div className="reader-layout">
        {isPptx ? (
          <PPTXViewer fileUrl={reader.fileUrl} />
        ) : (
          <>
            {sidebarOpen && (
              <PDFSidebar
                file={reader.file} fileUrl={reader.fileUrl} numPages={reader.numPages}
                pageNumber={reader.pageNumber} bookmarks={reader.bookmarks}
                onSelect={reader.setPageNumber} onBookmark={reader.toggleBookmark}
                onClose={() => setSidebarOpen(false)}
                readingMode={reader.readingMode} onReadingMode={reader.setReadingMode}
                scale={reader.scale} onZoom={reader.changeZoom}
                onFitWidth={reader.fitWidth} onFitPage={reader.fitPage}
                theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                allAnnotations={allAnnotations} onAnnotationNavigate={handleAnnotationNavigate}
                onDeleteAnnotation={deleteAnnotation} onClearAnnotations={clearAll}
              />
            )}
            <PDFViewer
              file={reader.file} numPages={reader.numPages}
              pageRefs={reader.pageRefs} viewerRef={reader.viewerRef}
              scale={reader.scale} rotation={reader.rotation} readingMode={reader.readingMode}
              onLoad={reader.onDocumentLoad}
              onError={(err) => reader.setError(err?.message || 'This PDF could not be opened.')}
              onScroll={reader.onViewerScroll}
              activeTool={activeTool} activeColor={activeColor}
              penColor={penColor} penSize={penSize}
              annotations={annotations}
              onAddAnnotation={addAnnotation} onDeleteAnnotation={deleteAnnotation} onUpdateAnnotation={updateAnnotation}
              onAddStroke={addStroke} onDeleteStroke={deleteStroke}
            />
          </>
        )}
      </div>

      {/* Desktop: sidebar reopen button */}
      {!isPptx && !sidebarOpen && (
        <button className="sidebar-reopen" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" title="Open sidebar">
          <PanelLeftOpen size={18} />
        </button>
      )}

      {/* Desktop bottom controls */}
      {!isPptx && (
        <PDFControls
          pageNumber={reader.pageNumber} numPages={reader.numPages}
          onPrevious={previous} onNext={next} onPageChange={reader.setPageNumber}
          onZoom={reader.changeZoom} onBookmark={() => reader.toggleBookmark()}
          bookmarked={reader.bookmarks.includes(reader.pageNumber)}
          readingMode={reader.readingMode} onReadingMode={reader.setReadingMode}
          onFitWidth={reader.fitWidth} onFitPage={reader.fitPage} fullscreen={fullscreen}
        />
      )}

      {/* Mobile bottom bar */}
      {!isPptx && (
        <MobileBottomBar
          pageNumber={reader.pageNumber} numPages={reader.numPages}
          onPrevious={previous} onNext={next}
          activeTool={activeTool} onToolChange={setActiveTool}
          onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}
          onBookmark={() => reader.toggleBookmark()}
          bookmarked={reader.bookmarks.includes(reader.pageNumber)}
          onSearch={() => setSearchOpen(true)}
          file={reader.file}
        />
      )}

      {showShortcuts && <Shortcuts onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

function Shortcuts({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div><p className="eyebrow">QUICK REFERENCE</p><h2>Keyboard shortcuts</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close shortcuts"><X size={17} /></button>
        </div>
        {[
          ['← / →', 'Previous or next page'],
          ['+ / −', 'Zoom in or out'],
          ['Ctrl+F', 'Search document'],
          ['F', 'Fullscreen'],
          ['H', 'Highlight tool'],
          ['U', 'Underline tool'],
          ['S', 'Strikethrough tool'],
          ['P', 'Pen / Draw'],
          ['E', 'Eraser'],
          ['T', 'Tick mark'],
          ['N', 'Sticky note'],
          ['Ctrl+Z', 'Undo'],
          ['Ctrl+Y', 'Redo'],
          ['Esc', 'Cancel / Close'],
        ].map(([key, label]) => (
          <div className="shortcut-row" key={key}><kbd>{key}</kbd><span>{label}</span></div>
        ))}
      </div>
    </div>
  )
}

export default App
