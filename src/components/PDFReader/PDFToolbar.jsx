import {
  Download, FilePlus2, Maximize2, Minus, MoreHorizontal, Plus,
  RotateCw, Search, Printer, PanelLeftClose, PanelLeftOpen,
  Highlighter, Underline, Strikethrough, CheckSquare, StickyNote,
  Undo2, Redo2,
} from 'lucide-react'
import ThemeToggle from '../ThemeToggle'
import PWAStatus from '../PWAStatus'
import RefreshButton from '../RefreshButton'
import { downloadDarkDocument } from '../../utils/downloadDarkDocument'

function ToolButton({ label, children, onClick, disabled = false, className = '' }) {
  return (
    <button
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Annotation tool toggle — highlights when active
function AnnToolButton({ label, active, onClick, disabled, children }) {
  return (
    <button
      className={`icon-button ${active ? 'ann-tool-active' : ''}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default function PDFToolbar({
  file, pageNumber, numPages, scale,
  onOpen, onSearch, onZoom, onRotate, onFullscreen,
  theme, onThemeToggle,
  onDownload, onDarkDownload, onPrint, onMore,
  sidebarOpen, onSidebar,
  canInstall, onInstall, isOnline,
  // annotation props
  activeTool, onToolChange,
  onUndo, onRedo, canUndo, canRedo,
  isPptx = file?.name?.toLowerCase().endsWith('.pptx'),
}) {
  const exportDark = onDarkDownload || (() =>
    downloadDarkDocument({ fileName: file?.name || 'document.pdf', isPptx })
      .catch((error) => window.alert(error?.message || 'The dark version could not be downloaded.'))
  )

  const toggleTool = (tool) => onToolChange?.(activeTool === tool ? null : tool)

  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div className="brand-copy">
          <strong>PDF Reader</strong>
          <span>Private document workspace</span>
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-document" title={file?.name || 'No document open'}>
        <span className="document-status" />
        <span>{file?.name || 'No document open'}</span>
      </div>
      <PWAStatus canInstall={canInstall} onInstall={onInstall} isOnline={isOnline} />

      <div className="toolbar-actions">
        {/* ── File ── */}
        <button className="toolbar-button" onClick={onOpen}>
          <FilePlus2 size={16} /> <span>{isPptx ? 'Open file' : 'Open PDF'}</span>
        </button>

        {!isPptx && (
          <>
            <ToolButton label="Search document" onClick={onSearch}><Search size={17} /></ToolButton>

            {/* ── Zoom ── */}
            <ToolButton label="Zoom out" onClick={() => onZoom(-0.1)} disabled={!file}><Minus size={17} /></ToolButton>
            <button className="zoom-readout" onClick={() => onZoom(0)}>{Math.round(scale * 100)}%</button>
            <ToolButton label="Zoom in" onClick={() => onZoom(0.1)} disabled={!file}><Plus size={17} /></ToolButton>

            <div className="page-readout">
              {file
                ? <><strong>{String(pageNumber).padStart(2, '0')}</strong><span>/ {String(numPages).padStart(2, '0')}</span></>
                : <span>-- / --</span>}
            </div>

            <ToolButton label="Rotate page" onClick={onRotate} disabled={!file}><RotateCw size={17} /></ToolButton>
            <ToolButton
              label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              className="sidebar-toggle"
              onClick={onSidebar}
            >
              {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
            </ToolButton>

            <div className="toolbar-divider" />

            {/* ── Annotation tools ── */}
            <AnnToolButton
              label="Highlight text (H)"
              active={activeTool === 'highlight'}
              disabled={!file}
              onClick={() => toggleTool('highlight')}
            >
              <Highlighter size={16} />
            </AnnToolButton>

            <AnnToolButton
              label="Underline text (U)"
              active={activeTool === 'underline'}
              disabled={!file}
              onClick={() => toggleTool('underline')}
            >
              <Underline size={16} />
            </AnnToolButton>

            <AnnToolButton
              label="Strikethrough text (S)"
              active={activeTool === 'strikethrough'}
              disabled={!file}
              onClick={() => toggleTool('strikethrough')}
            >
              <Strikethrough size={16} />
            </AnnToolButton>

            <AnnToolButton
              label="Place tick / checkbox (T)"
              active={activeTool === 'tick'}
              disabled={!file}
              onClick={() => toggleTool('tick')}
            >
              <CheckSquare size={16} />
            </AnnToolButton>

            <AnnToolButton
              label="Add sticky note (N)"
              active={activeTool === 'note'}
              disabled={!file}
              onClick={() => toggleTool('note')}
            >
              <StickyNote size={16} />
            </AnnToolButton>

            <div className="toolbar-divider" />

            {/* ── Undo / Redo ── */}
            <ToolButton label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}><Undo2 size={16} /></ToolButton>
            <ToolButton label="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}><Redo2 size={16} /></ToolButton>
          </>
        )}

        <ToolButton label="Fullscreen" onClick={onFullscreen}><Maximize2 size={17} /></ToolButton>
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />

        {!isPptx && (
          <ToolButton label="Print document" onClick={onPrint} disabled={!file}><Printer size={17} /></ToolButton>
        )}

        <ToolButton label="Download document" className="download-control" onClick={onDownload} disabled={!file}><Download size={17} /></ToolButton>
        <ToolButton label="Download dark version" className="download-control dark-download-control" onClick={exportDark} disabled={!file}><Download size={15} /></ToolButton>
        <ToolButton label="More options" onClick={onMore}><MoreHorizontal size={18} /></ToolButton>
        <RefreshButton />
      </div>
    </header>
  )
}
