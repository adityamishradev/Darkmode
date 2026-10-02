import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Document, Page } from 'react-pdf'

export default function PDFViewer({ fileUrl, numPages, pageRefs, viewerRef, scale, rotation, readingMode, onLoad, onError, onScroll }) {
  return <section className={`viewer reading-${readingMode}`} ref={viewerRef} onScroll={onScroll}><div className="page-stack"><Document file={fileUrl} onLoadSuccess={onLoad} onLoadError={onError} loading={<div className="viewer-loading"><LoaderCircle className="spin" size={24} /><span>Preparing your document…</span></div>} error={<div className="viewer-error"><AlertTriangle size={25} /><strong>Couldn’t render this PDF</strong><span>Try another PDF file or check that it is not password protected.</span></div>}>{Array.from({ length: numPages }, (_, index) => <div className="pdf-page" key={index + 1} ref={(node) => { pageRefs.current[index + 1] = node }}><Page pageNumber={index + 1} scale={scale} rotate={rotation} renderTextLayer renderAnnotationLayer loading={<div className="page-loading"><LoaderCircle className="spin" size={18} /></div>} /></div>)}</Document></div></section>
}
