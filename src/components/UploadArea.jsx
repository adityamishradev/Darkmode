import { ChevronRight, FileSpreadsheet, FileText, FileUp, FolderOpen, Leaf, MoreVertical, Presentation, ShieldCheck, WifiOff, Zap } from 'lucide-react'
import { useRef, useState } from 'react'

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

export default function UploadArea({ onOpen, error, isLoading, recentFiles = [] }) {
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

      {/* Recent Files — only shown when there's real history */}
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
                <MoreVertical size={18} />
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

      {/* No recent files yet — show features grid only */}
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
