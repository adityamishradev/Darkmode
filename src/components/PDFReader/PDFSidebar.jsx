import { Bookmark, FileText, PanelLeftClose } from 'lucide-react'
import PDFThumbnail from './PDFThumbnail'

export default function PDFSidebar({ file, fileUrl, numPages, pageNumber, bookmarks, onSelect, onBookmark, isBookmarked, onClose }) {
  return <aside className="sidebar"><div className="sidebar-heading"><div><p className="eyebrow">DOCUMENT</p><h2>{file?.name || 'Untitled document'}</h2></div><button className="icon-button mobile-only" onClick={onClose} aria-label="Close sidebar"><PanelLeftClose size={17} /></button></div>
    {file && <div className="file-meta"><FileText size={15} /><span>{(file.size / 1024 / 1024).toFixed(2)} MB</span><span className="meta-dot" /> <span>{numPages} pages</span></div>}
    <div className="sidebar-section"><div className="section-label"><span>Pages</span><span>{numPages || '—'}</span></div><div className="thumbnail-list">{fileUrl && Array.from({ length: numPages }, (_, index) => <PDFThumbnail key={index + 1} fileUrl={fileUrl} page={index + 1} selected={pageNumber === index + 1} onSelect={onSelect} />)}</div></div>
    <div className="sidebar-section bookmark-section"><div className="section-label"><span>Bookmarks</span><span>{bookmarks.length || '—'}</span></div>{bookmarks.length ? bookmarks.map((page) => <button className="bookmark-row" key={page} onClick={() => onSelect(page)}><Bookmark size={14} fill="currentColor" /><span>Page {page}</span><span className="bookmark-page">{page}</span></button>) : <p className="empty-state">Save pages for quick access with the bookmark button below.</p>}</div>
    <div className="sidebar-footer"><span className="status-dot" /> Local document</div>
  </aside>
}
