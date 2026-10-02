import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, Keyboard, X } from 'lucide-react'
import UploadArea from './components/UploadArea'
import PDFControls from './components/PDFReader/PDFControls'
import PDFSearch from './components/PDFReader/PDFSearch'
import PDFSidebar from './components/PDFReader/PDFSidebar'
import PDFToolbar from './components/PDFReader/PDFToolbar'
import PDFViewer from './components/PDFReader/PDFViewer'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { usePDFReader } from './hooks/usePDFReader'
import { useTheme } from './hooks/useTheme'
import { usePWA } from './hooks/usePWA'
import PWAStatus from './components/PWAStatus'

function App() {
  const reader = usePDFReader()
  const { theme, setTheme } = useTheme()
  const { canInstall, install, isOnline } = usePWA()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const fileInputRef = useRef(null)
  const openPicker = () => fileInputRef.current?.click()
  const previous = useCallback(() => reader.setPageNumber(reader.pageNumber - 1), [reader])
  const next = useCallback(() => reader.setPageNumber(reader.pageNumber + 1), [reader])
  const first = useCallback(() => reader.setPageNumber(1), [reader])
  const last = useCallback(() => reader.setPageNumber(reader.numPages), [reader])
  const toggleFullscreen = useCallback(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.() }, [])
  useKeyboardShortcuts({ onPrevious: previous, onNext: next, onZoomIn: () => reader.changeZoom(0.1), onZoomOut: () => reader.changeZoom(-0.1), onSearch: () => setSearchOpen(true), onFullscreen: toggleFullscreen, onFirst: first, onLast: last, onEscape: () => { setSearchOpen(false); document.exitFullscreen?.() } })
  useEffect(() => { const onChange = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', onChange); return () => document.removeEventListener('fullscreenchange', onChange) }, [])
  useEffect(() => {
    document.querySelectorAll('.textLayer span').forEach((span) => {
      span.style.backgroundColor = searchQuery && span.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) ? 'rgba(255, 203, 72, .55)' : ''
    })
  }, [searchQuery, reader.numPages])
  const download = () => { const link = document.createElement('a'); link.href = reader.fileUrl; link.download = reader.file?.name || 'document.pdf'; link.click() }
  const print = () => { const frame = document.createElement('iframe'); frame.style.display = 'none'; frame.src = reader.fileUrl; document.body.appendChild(frame); frame.onload = () => frame.contentWindow.print() }
  if (!reader.fileUrl) return <div className="app-shell"><header className="toolbar"><div className="brand"><div className="brand-mark">P</div><span>PDF Reader</span></div><PWAStatus canInstall={canInstall} onInstall={install} isOnline={isOnline} /><button className="shortcut-hint" onClick={() => setShowShortcuts(true)}><Keyboard size={15} /> Shortcuts</button></header><UploadArea onOpen={reader.openFile} error={reader.error} isLoading={reader.isLoading} />{showShortcuts && <Shortcuts onClose={() => setShowShortcuts(false)} />}</div>
  return <div className={`app-shell ${fullscreen ? 'is-fullscreen' : ''}`}><PDFToolbar file={reader.file} pageNumber={reader.pageNumber} numPages={reader.numPages} scale={reader.scale} onOpen={openPicker} onSearch={() => setSearchOpen(true)} onZoom={reader.changeZoom} onRotate={() => reader.setRotation((reader.rotation + 90) % 360)} onFullscreen={toggleFullscreen} theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} onDownload={download} onPrint={print} onMore={() => setShowShortcuts(true)} sidebarOpen={sidebarOpen} onSidebar={() => setSidebarOpen((open) => !open)} /><input ref={fileInputRef} hidden type="file" accept="application/pdf,.pdf" onChange={(event) => reader.openFile(event.target.files?.[0])} />{searchOpen && <PDFSearch onClose={() => { setSearchOpen(false); setSearchQuery('') }} onFind={setSearchQuery} />}<div className="reader-layout">{sidebarOpen && <PDFSidebar file={reader.file} fileUrl={reader.fileUrl} numPages={reader.numPages} pageNumber={reader.pageNumber} bookmarks={reader.bookmarks} onSelect={reader.setPageNumber} onBookmark={reader.toggleBookmark} onClose={() => setSidebarOpen(false)} />}<PDFViewer file={reader.file} numPages={reader.numPages} pageRefs={reader.pageRefs} viewerRef={reader.viewerRef} scale={reader.scale} rotation={reader.rotation} readingMode={reader.readingMode} onLoad={reader.onDocumentLoad} onError={(error) => reader.setError(error?.message || 'This PDF could not be opened.')} onScroll={reader.onViewerScroll} /></div><PDFControls pageNumber={reader.pageNumber} numPages={reader.numPages} onPrevious={previous} onNext={next} onPageChange={reader.setPageNumber} onZoom={reader.changeZoom} onBookmark={() => reader.toggleBookmark()} bookmarked={reader.bookmarks.includes(reader.pageNumber)} readingMode={reader.readingMode} onReadingMode={reader.setReadingMode} onFitWidth={reader.fitWidth} onFitPage={reader.fitPage} fullscreen={fullscreen} />{showShortcuts && <Shortcuts onClose={() => setShowShortcuts(false)} />}</div>
}

function Shortcuts({ onClose }) { return <div className="modal-backdrop" onClick={onClose}><div className="shortcuts-modal" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">QUICK REFERENCE</p><h2>Keyboard shortcuts</h2></div><button className="icon-button" onClick={onClose} aria-label="Close shortcuts"><X size={17} /></button></div>{[['← / →', 'Previous or next page'], ['+ / −', 'Zoom in or out'], ['⌘ / Ctrl + F', 'Search document'], ['F', 'Toggle fullscreen'], ['Home / End', 'First or last page']].map(([key, label]) => <div className="shortcut-row" key={key}><kbd>{key}</kbd><span>{label}</span></div>)}</div></div> }

export default App
