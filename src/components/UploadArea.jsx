import { FileUp, FolderOpen } from 'lucide-react'
import { useRef, useState } from 'react'

export default function UploadArea({ onOpen, error, isLoading }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const accept = (files) => files?.[0] && onOpen(files[0])
  return <main className="upload-main">
    <div className={`upload-card ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files) }}>
      <div className="upload-icon"><FileUp size={30} /></div>
      <p className="eyebrow">PRIVATE BY DESIGN</p>
      <h1>Open your PDF</h1>
      <p className="upload-copy">Drag & drop a document here, or choose one from your device.</p>
      <button className="primary-button" onClick={() => inputRef.current?.click()} disabled={isLoading}><FolderOpen size={17} /> {isLoading ? 'Opening…' : 'Browse files'}</button>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => accept(event.target.files)} />
      <p className="upload-note">PDF up to 500 MB · Your files never leave this browser</p>
      <div className="upload-features"><span>Private</span><span>Offline-ready</span><span>Fast in-browser rendering</span></div>
      {error && <p className="error-text">{error}</p>}
    </div>
  </main>
}
