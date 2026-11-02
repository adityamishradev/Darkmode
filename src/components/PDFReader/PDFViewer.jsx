import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Document, Page } from 'react-pdf'
import { useEffect, useRef, useState } from 'react'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import './night-mode.css'
import './annotation.css'
import AnnotationLayer from './AnnotationLayer'
import DrawingLayer from './DrawingLayer'

const PDF_OPTIONS = { cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/', cMapPacked: true }
const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1

// ─────────────────────────────────────────────────────────────────────────────
// PDFPage — per-page wrapper that gives AnnotationLayer a stable DOM node
// ─────────────────────────────────────────────────────────────────────────────
function PDFPage({
  page, scale, rotation, renderedPages,
  activeTool, activeColor, penColor, penSize,
  pageAnnotations, pageStrokes,
  onPageRef, onAddAnnotation, onDeleteAnnotation, onUpdateAnnotation,
  onAddStroke, onDeleteStroke,
}) {
  // pageNode holds the actual .pdf-page DOM element
  const [pageNode, setPageNode] = useState(null)

  const refCallback = (node) => {
    setPageNode(node)        // triggers re-render so layers get fresh node
    onPageRef(page, node)   // keep parent pageRefs in sync
  }

  const isRendered    = renderedPages.has(page)
  const isDrawingTool = activeTool === 'pen' || activeTool === 'eraser'

  return (
    <div
      className={[
        'pdf-page',
        isRendered ? '' : 'pdf-page-placeholder',
        activeTool ? 'tool-active' : '',
      ].filter(Boolean).join(' ')}
      ref={refCallback}
      style={{ position: 'relative' }}
    >
      {isRendered ? (
        <Page
          pageNumber={page}
          scale={scale}
          rotate={rotation}
          devicePixelRatio={DPR}
          renderTextLayer
          renderAnnotationLayer
          loading={<div className="page-loading"><LoaderCircle className="spin" size={18} /></div>}
        />
      ) : (
        <div className="page-loading"><LoaderCircle className="spin" size={18} /></div>
      )}

      {/* AnnotationLayer — mounts as soon as the div node exists */}
      {pageNode && (
        <AnnotationLayer
          page={page}
          pageEl={pageNode}
          annotations={pageAnnotations}
          // Don't pass drawing-related tools to AnnotationLayer
          activeTool={isRendered && !isDrawingTool ? activeTool : null}
          activeColor={activeColor}
          onAdd={onAddAnnotation}
          onDelete={onDeleteAnnotation}
          onUpdate={onUpdateAnnotation}
        />
      )}

      {/* DrawingLayer — pen & eraser */}
      {pageNode && (
        <DrawingLayer
          page={page}
          pageEl={isRendered ? pageNode : null}
          strokes={pageStrokes}
          activeTool={isRendered && isDrawingTool ? activeTool : null}
          penColor={penColor}
          penSize={penSize}
          onAddStroke={onAddStroke}
          onDeleteStroke={onDeleteStroke}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PDFViewer
// ─────────────────────────────────────────────────────────────────────────────
export default function PDFViewer({
  file, numPages, pageRefs, viewerRef, scale, rotation, readingMode,
  onLoad, onError, onScroll,
  activeTool, activeColor, penColor, penSize,
  annotations, onAddAnnotation, onDeleteAnnotation, onUpdateAnnotation,
  onAddStroke, onDeleteStroke,
}) {
  const [documentError, setDocumentError] = useState('')
  const [renderedPages, setRenderedPages] = useState(() => new Set([1, 2]))

  useEffect(() => { setDocumentError(''); setRenderedPages(new Set([1, 2])) }, [file])
  useEffect(() => {
    window.__pdfReaderFile = file
    return () => { if (window.__pdfReaderFile === file) delete window.__pdfReaderFile }
  }, [file])

  const handleError = (err) => {
    setDocumentError(err?.message || 'The PDF could not be read.')
    onError?.(err)
  }

  const handleScroll = () => {
    const viewer = viewerRef.current
    if (!viewer || !numPages) return
    const h = Math.max(560, viewer.clientWidth * 1.3)
    const cur = Math.floor(viewer.scrollTop / h) + 1
    setRenderedPages((prev) => {
      const next = new Set(prev)
      for (let p = Math.max(1, cur - 2); p <= Math.min(numPages, cur + 3); p++) next.add(p)
      return next
    })
    onScroll?.()
  }

  const isDropTool = activeTool === 'tick' || activeTool === 'note'
  const viewerClass = ['viewer', `reading-${readingMode}`, isDropTool ? 'tick-drop-mode' : ''].filter(Boolean).join(' ')

  return (
    <section className={viewerClass} ref={viewerRef} onScroll={handleScroll}>
      <div className="page-stack">
        {documentError ? (
          <div className="viewer-error">
            <AlertTriangle size={25} />
            <strong>Couldn't render this PDF</strong>
            <span>{documentError}</span>
            <small>Try another PDF or check if it is password-protected.</small>
          </div>
        ) : (
          <Document
            file={file}
            options={PDF_OPTIONS}
            onLoadSuccess={(r) => { setDocumentError(''); onLoad(r) }}
            onLoadError={handleError}
            loading={
              <div className="viewer-loading">
                <LoaderCircle className="spin" size={24} />
                <span>Preparing your document…</span>
              </div>
            }
          >
            {Array.from({ length: numPages }, (_, i) => {
              const page = i + 1
              const all            = annotations?.[page] || []
              const pageAnnotations = all.filter((a) => a.type !== 'drawing')
              const pageStrokes     = all.filter((a) => a.type === 'drawing')
              return (
                <PDFPage
                  key={page}
                  page={page}
                  scale={scale}
                  rotation={rotation}
                  renderedPages={renderedPages}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  penColor={penColor}
                  penSize={penSize}
                  pageAnnotations={pageAnnotations}
                  pageStrokes={pageStrokes}
                  onPageRef={(pg, node) => { pageRefs.current[pg] = node }}
                  onAddAnnotation={onAddAnnotation}
                  onDeleteAnnotation={onDeleteAnnotation}
                  onUpdateAnnotation={onUpdateAnnotation}
                  onAddStroke={onAddStroke}
                  onDeleteStroke={onDeleteStroke}
                />
              )
            })}
          </Document>
        )}
      </div>
    </section>
  )
}
