import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Document, Page } from 'react-pdf'
import { useEffect, useState } from 'react'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import './night-mode.css'

// Shared Document options — prevents re-parsing the PDF on every re-render
const PDF_OPTIONS = { cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/', cMapPacked: true }

export default function PDFViewer({ file, numPages, pageRefs, viewerRef, scale, rotation, readingMode, onLoad, onError, onScroll }) {
  const [documentError, setDocumentError] = useState('')
  const [renderedPages, setRenderedPages] = useState(() => new Set([1, 2]))
  useEffect(() => setDocumentError(''), [file])
  useEffect(() => setRenderedPages(new Set([1, 2])), [file])
  useEffect(() => {
    window.__pdfReaderFile = file
    return () => { if (window.__pdfReaderFile === file) delete window.__pdfReaderFile }
  }, [file])
  const handleError = (error) => {
    const message = error?.message || 'The PDF could not be read.'
    setDocumentError(message)
    onError?.(error)
  }
  const handleScroll = () => {
    const viewer = viewerRef.current
    if (viewer && numPages) {
      const estimatedPageHeight = Math.max(560, viewer.clientWidth * 1.3)
      const currentPage = Math.floor(viewer.scrollTop / estimatedPageHeight) + 1
      setRenderedPages((current) => {
        const next = new Set(current)
        for (let page = Math.max(1, currentPage - 2); page <= Math.min(numPages, currentPage + 3); page += 1) next.add(page)
        return next
      })
    }
    onScroll?.()
  }
  return <section className={`viewer reading-${readingMode}`} ref={viewerRef} onScroll={handleScroll}><div className="page-stack">{documentError ? <div className="viewer-error"><AlertTriangle size={25} /><strong>Couldn’t render this PDF</strong><span>{documentError}</span><small>Try another PDF or check whether it is password protected.</small></div> : <Document file={file} options={PDF_OPTIONS} onLoadSuccess={(result) => { setDocumentError(''); onLoad(result) }} onLoadError={handleError} loading={<div className="viewer-loading"><LoaderCircle className="spin" size={24} /><span>Preparing your document…</span></div>}>{Array.from({ length: numPages }, (_, index) => { const page = index + 1; return <div className={`pdf-page ${renderedPages.has(page) ? '' : 'pdf-page-placeholder'}`} key={page} ref={(node) => { pageRefs.current[page] = node }}>{renderedPages.has(page) ? <Page pageNumber={page} scale={scale} rotate={rotation} renderTextLayer renderAnnotationLayer loading={<div className="page-loading"><LoaderCircle className="spin" size={18} /></div>} /> : <div className="page-loading"><LoaderCircle className="spin" size={18} /></div>}</div> })}</Document>}</div></section>
}
