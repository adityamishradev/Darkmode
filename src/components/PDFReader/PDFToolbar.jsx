import {
  Download, FilePlus2, Maximize2, Minus, MoreHorizontal, Plus,
  RotateCw, Search, Printer, PanelLeftClose, PanelLeftOpen,
  Highlighter, Underline, Strikethrough, CheckSquare, StickyNote,
  Pen, Eraser, Undo2, Redo2,
} from 'lucide-react'
import ThemeToggle from '../ThemeToggle'
import PWAStatus from '../PWAStatus'
import RefreshButton from '../RefreshButton'
import { downloadDarkDocument } from '../../utils/downloadDarkDocument'

function Btn({ label, children, onClick, disabled = false, className = '' }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function AnnBtn({ label, active, onClick, disabled, children }) {
  return (
    <button
      className={`icon-button${active ? ' ann-tool-active' : ''}`}
      aria-label={label} title={label} onClick={onClick} disabled={disabled}
    >
      {children}
    </button>
  )
}

export default function PDFToolbar({
  file, pageNumber, numPages, scale,
  onOpen, onSearch, onZoom, onRotate, onFullscreen,
  theme, onThemeToggle, onDownload, onDarkDownload, onPrint, onMore,
  sidebarOpen, onSidebar, canInstall, onInstall, isOnline,
  activeTool, onToolChange, onUndo, onRedo, canUndo, canRedo,
  isPptx = file?.name?.toLowerCase().endsWith('.pptx'),
}) {
  const exportDark = onDarkDownload || (() =>
    downloadDarkDocument({ fileName: file?.name || 'document.pdf', isPptx })
      .catch((e) => window.alert(e?.message || 'Download failed.'))
  )
  const toggle = (t) => onToolChange?.(activeTool === t ? null : t)

  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div className="brand-copy">
          <strong>PDF Reader</strong>
          <span className="brand-sub">Private workspace</span>
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-document" title={file?.name || 'No document open'}>
        <span className="document-status" />
        <span>{file?.name || 'No document open'}</span>
      </div>
      <PWAStatus canInstall={canInstall} onInstall={onInstall} isOnline={isOnline} />

      <div className="toolbar-actions">
        <button className="toolbar-button" onClick={onOpen}>
          <FilePlus2 size={16} /><span>{isPptx ? 'Open file' : 'Open PDF'}</span>
        </button>

        {!isPptx && (
          <>
            <Btn label="Search (Ctrl+F)" onClick={onSearch}><Search size={17} /></Btn>

            <Btn label="Zoom out" onClick={() => onZoom(-0.1)} disabled={!file}><Minus size={17} /></Btn>
            <button className="zoom-readout" onClick={() => onZoom(0)}>{Math.round(scale * 100)}%</button>
            <Btn label="Zoom in" onClick={() => onZoom(0.1)} disabled={!file}><Plus size={17} /></Btn>

            <div className="page-readout">
              {file
                ? <><strong>{String(pageNumber).padStart(2,'0')}</strong><span>/ {String(numPages).padStart(2,'0')}</span></>
                : <span>-- / --</span>}
            </div>

            <Btn label="Rotate" onClick={onRotate} disabled={!file}><RotateCw size={17} /></Btn>
            <Btn label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} className="sidebar-toggle" onClick={onSidebar}>
              {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
            </Btn>

            <div className="toolbar-divider" />

            {/* ── Annotation tools ── */}
            <AnnBtn label="Highlight (H)" active={activeTool==='highlight'} disabled={!file} onClick={() => toggle('highlight')}><Highlighter size={16} /></AnnBtn>
            <AnnBtn label="Underline (U)" active={activeTool==='underline'} disabled={!file} onClick={() => toggle('underline')}><Underline size={16} /></AnnBtn>
            <AnnBtn label="Strikethrough (S)" active={activeTool==='strikethrough'} disabled={!file} onClick={() => toggle('strikethrough')}><Strikethrough size={16} /></AnnBtn>
            <AnnBtn label="Pen / Draw (P)" active={activeTool==='pen'} disabled={!file} onClick={() => toggle('pen')}><Pen size={16} /></AnnBtn>
            <AnnBtn label="Eraser (E)" active={activeTool==='eraser'} disabled={!file} onClick={() => toggle('eraser')}><Eraser size={16} /></AnnBtn>
            <AnnBtn label="Tick mark (T)" active={activeTool==='tick'} disabled={!file} onClick={() => toggle('tick')}><CheckSquare size={16} /></AnnBtn>
            <AnnBtn label="Sticky note (N)" active={activeTool==='note'} disabled={!file} onClick={() => toggle('note')}><StickyNote size={16} /></AnnBtn>

            <div className="toolbar-divider" />

            <Btn label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}><Undo2 size={16} /></Btn>
            <Btn label="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}><Redo2 size={16} /></Btn>
          </>
        )}

        <Btn label="Fullscreen (F)" onClick={onFullscreen}><Maximize2 size={17} /></Btn>
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        {!isPptx && <Btn label="Print" onClick={onPrint} disabled={!file}><Printer size={17} /></Btn>}
        <Btn label="Download" className="download-control" onClick={onDownload} disabled={!file}><Download size={17} /></Btn>
        <Btn label="Download dark version" className="download-control dark-download-control" onClick={exportDark} disabled={!file}><Download size={15} /></Btn>
        <Btn label="More options" onClick={onMore}><MoreHorizontal size={18} /></Btn>
        <RefreshButton />
      </div>
    </header>
  )
}
