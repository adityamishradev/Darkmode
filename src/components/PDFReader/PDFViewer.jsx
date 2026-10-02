import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Document, Page } from 'react-pdf'
import { useState } from 'react'

export default function PDFViewer({ file, numPages, pageRefs, viewerRef, scale, rotation, readingMode, onLoad, onError, onScroll }) {
  const [documentError, setDocumentError] = useState('')
  const handleError = (error) => {
    const message = error?.message || 'The PDF could not be read.'
    setDocumentError(message)
    onError?.(error)
  }
  return <section className={`viewer reading-${readingMode}`} ref={viewerRef} onScroll={onScroll}><div className="page-stack">{documentError ? <div className="viewer-error"><AlertTriangle size={25} /><strong>Couldn’t render this PDF</strong><span>{documentError}</span><small>Try another PDF or check whether it is password protected.</small></div> : <Document file={file} onLoadSuccess={onLoad} onLoadError={handleError} loading={<div className="viewer-loading"><LoaderCircle className="spin" size={24} /><span>Preparing your document…</span></div>}>{Array.from({ length: numPages }, (_, index) => <div className="pdf-page" key={index + 1} ref={(node) => { pageRefs.current[index + 1] = node }}><Page pageNumber={index + 1} scale={scale} rotate={rotation} renderTextLayer renderAnnotationLayer loading={<div className="page-loading"><LoaderCircle className="spin" size={18} /></div>} /></div>)}</Document>}</div></section>
}
