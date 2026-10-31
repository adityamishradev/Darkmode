import { ChevronRight, FileSpreadsheet, FileText, FileUp, FolderOpen, Leaf, MoreVertical, Pencil, Presentation, ShieldCheck, Trash2, WifiOff, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function formatDate(ts) {
  const now = Date.now()
  const diff = now - ts
  const date = new Date(ts)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 60 * 60 * 1000) {
    const mins = Math.max(1, Math.floor(diff / 60000))
    return `${mins} min ago`
  }
  if (diff < 24 * 60 * 60 * 1000) return `Today, ${timeStr}`
  if (diff < 48 * 60 * 60 * 1000) return `Yesterday, ${timeStr}`
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Three-dot dropdown ──────────────────────────────────────────────────────
function FileMenu({ file, onDelete, onRename }) {
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(file.name)
  const menuRef = useRef(null)
  const inputRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Focus input when rename mode opens
  useEffect(() => {
    if (renaming) {
      setNewName(file.name)
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [renaming, file.name])

  const handleRename = () => {
    onRename(file.name, newName)
    setRenaming(false)
    setOpen(false)
  }

  if (renaming) {
    return (
      <div className="rename-inline" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="rename-input"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') { setRenaming(false); setOpen(false) }
          }}
        />
        <button className="rename-save" onClick={handleRename}>Save</button>
        <button className="rename-cancel" onClick={() => { setRenaming(false); setOpen(false) }}>✕</button>
      </div>
    )
  }

  return (
    <div className="file-menu-wrap" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        className="file-menu-btn"
        aria-label="More options"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="file-menu-dropdown">
          <button
            className="file-menu-item"
            onClick={() => { setRenaming(true); setOpen(false) }}
          >
            <Pencil size={14} /> Edit name
          </button>
          <button
            className="file-menu-item danger"
            onClick={() => { onDelete(file.name); setOpen(false) }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function UploadArea({ onOpen, error, isLoading, recentFiles = [], onDeleteRecent, onRenameRecent }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const accept = (files) => files?.[0] && onOpen(files[0])

  return (
    <main
      className="upload-main"
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files) }}
    >
      <div className={`upload-card ${dragging ? 'is-dragging' : ''}`}>
        <div className="upload-hero">
          <span className="file-orbit orbit-word"><FileText size={22} />W</span>
          <span className="file-orbit orbit-pdf"><FileText size={22} /></span>
          <span className="file-orbit orbit-ppt"><Presentation size={22} />P</span>
          <span className="file-orbit orbit-sheet"><FileSpreadsheet size={22} />X</span>
          <div className="upload-icon"><FileUp size={30} /></div>
        </div>
        <p className="eyebrow">PRIVATE BY DESIGN</p>
        <h1>Open a <em>Document</em></h1>
        <p className="upload-copy">Drag &amp; drop a PDF or PowerPoint presentation here, or choose one from your device.</p>
        <button className="primary-button" onClick={() => inputRef.current?.click()} disabled={isLoading}>
          <FolderOpen size={17} /> {isLoading ? 'Opening…' : 'Browse files'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx"
          hidden
          onChange={(e) => accept(e.target.files)}
        />
        <div className="upload-or"><span />or<span /></div>
        <p className="upload-note">PDF or PPTX up to 500 MB · Your files never leave this browser</p>
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <section className="recent-files" aria-label="Recent files">
          <div className="recent-heading">
            <h2>Recent Files</h2>
            {recentFiles.length > 3 && (
              <button type="button">See all <ChevronRight size={17} /></button>
            )}
          </div>
          <div className="recent-list">
            {recentFiles.slice(0, 5).map((f) => (
              <div key={f.name + f.openedAt} className="recent-file">
                <span className={`recent-icon ${f.type === 'pptx' ? 'ppt' : 'pdf'}`}>
                  {f.type === 'pptx' ? <Presentation size={20} /> : <FileText size={20} />}
                </span>
                <span>
                  <strong>{f.name}</strong>
                  <small>{formatSize(f.size)} · {formatDate(f.openedAt)}</small>
                </span>
                <FileMenu
                  file={f}
                  onDelete={onDeleteRecent}
                  onRename={onRenameRecent}
                />
              </div>
            ))}
          </div>
          <div className="landing-features">
            <span><Zap size={19} />Fast<br />Performance</span>
            <span><ShieldCheck size={19} />100%<br />Private</span>
            <span><WifiOff size={19} />Works<br />Offline</span>
            <span><Leaf size={19} />Lightweight<br />&amp; Secure</span>
          </div>
        </section>
      )}

      {/* No recent files yet */}
      {recentFiles.length === 0 && (
        <section className="recent-files" aria-label="Features">
          <div className="landing-features">
            <span><Zap size={19} />Fast<br />Performance</span>
            <span><ShieldCheck size={19} />100%<br />Private</span>
            <span><WifiOff size={19} />Works<br />Offline</span>
            <span><Leaf size={19} />Lightweight<br />&amp; Secure</span>
          </div>
        </section>
      )}
    </main>
  )
}
