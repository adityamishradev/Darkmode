import { Download, FilePlus2, Maximize2, Minus, MoreHorizontal, Plus, RotateCw, Search, Printer, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'

function ToolButton({ label, children, onClick, disabled = false }) { return <button className="icon-button" aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</button> }

export default function PDFToolbar({ file, pageNumber, numPages, scale, onOpen, onSearch, onZoom, onRotate, onFullscreen, theme, onThemeToggle, onDownload, onPrint, sidebarOpen, onSidebar }) {
  return <header className="toolbar">
    <div className="brand"><div className="brand-mark">P</div><span>PDF Reader</span></div>
    <div className="toolbar-divider" />
    <div className="toolbar-actions">
      <button className="toolbar-button" onClick={onOpen}><FilePlus2 size={16} /> <span>Open PDF</span></button>
      <ToolButton label="Search document" onClick={onSearch}><Search size={17} /></ToolButton>
      <ToolButton label="Zoom out" onClick={() => onZoom(-0.1)} disabled={!file}><Minus size={17} /></ToolButton>
      <button className="zoom-readout" onClick={() => onZoom(0)}>{Math.round(scale * 100)}%</button>
      <ToolButton label="Zoom in" onClick={() => onZoom(0.1)} disabled={!file}><Plus size={17} /></ToolButton>
      <div className="page-readout">{file ? <><strong>{String(pageNumber).padStart(2, '0')}</strong><span>/ {String(numPages).padStart(2, '0')}</span></> : <span>-- / --</span>}</div>
      <ToolButton label="Rotate page" onClick={onRotate} disabled={!file}><RotateCw size={17} /></ToolButton>
      <ToolButton label="Toggle sidebar" onClick={onSidebar}>{sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}</ToolButton>
      <ToolButton label="Fullscreen" onClick={onFullscreen}><Maximize2 size={17} /></ToolButton>
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      <ToolButton label="Print document" onClick={onPrint} disabled={!file}><Printer size={17} /></ToolButton>
      <ToolButton label="Download document" onClick={onDownload} disabled={!file}><Download size={17} /></ToolButton>
      <ToolButton label="More options" onClick={() => window.alert('Use the keyboard shortcuts for fast navigation.')}><MoreHorizontal size={18} /></ToolButton>
    </div>
  </header>
}
