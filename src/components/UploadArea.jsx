import { ChevronRight, FileSpreadsheet, FileText, FileUp, FolderOpen, Leaf, MoreVertical, Presentation, ShieldCheck, WifiOff, Zap } from 'lucide-react'
import { useRef, useState } from 'react'

export default function UploadArea({ onOpen, error, isLoading }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const accept = (files) => files?.[0] && onOpen(files[0])
  return <main className="upload-main">
    <div className={`upload-card ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files) }}>
      <div className="upload-hero"><span className="file-orbit orbit-word"><FileText size={22} />W</span><span className="file-orbit orbit-pdf"><FileText size={22} /></span><span className="file-orbit orbit-ppt"><Presentation size={22} />P</span><span className="file-orbit orbit-sheet"><FileSpreadsheet size={22} />X</span><div className="upload-icon"><FileUp size={30} /></div></div>
      <p className="eyebrow">PRIVATE BY DESIGN</p>
      <h1>Open a <em>Document</em></h1>
      <p className="upload-copy">Drag & drop a PDF or PowerPoint presentation here, or choose one from your device.</p>
      <button className="primary-button" onClick={() => inputRef.current?.click()} disabled={isLoading}><FolderOpen size={17} /> {isLoading ? 'Opening…' : 'Browse files'}</button>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx" hidden onChange={(event) => accept(event.target.files)} />
      <div className="upload-or"><span />or<span /></div>
      <p className="upload-note">PDF or PPTX up to 500 MB · Your files never leave this browser</p>
      {error && <p className="error-text">{error}</p>}
    </div>
    <section className="recent-files" aria-label="Recent files"><div className="recent-heading"><h2>Recent Files</h2><button type="button">See all <ChevronRight size={17} /></button></div><div className="recent-list"><button className="recent-file" type="button"><span className="recent-icon pdf"><FileText size={20} /></span><span><strong>Project Proposal.pdf</strong><small>2.4 MB · Today, 8:20 PM</small></span><MoreVertical size={18} /></button><button className="recent-file" type="button"><span className="recent-icon ppt"><Presentation size={20} /></span><span><strong>Marketing Presentation.pptx</strong><small>5.1 MB · Yesterday, 6:15 PM</small></span><MoreVertical size={18} /></button><button className="recent-file" type="button"><span className="recent-icon pdf"><FileText size={20} /></span><span><strong>Notes.pdf</strong><small>800 KB · 12 Aug, 2024</small></span><MoreVertical size={18} /></button></div><div className="landing-features"><span><Zap size={19} />Fast<br />Performance</span><span><ShieldCheck size={19} />100%<br />Private</span><span><WifiOff size={19} />Works<br />Offline</span><span><Leaf size={19} />Lightweight<br />&amp; Secure</span></div></section>
  </main>
}
