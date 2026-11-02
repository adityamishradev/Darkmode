import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Document, Page } from 'react-pdf'
import { useEffect, useRef, useState } from 'react'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import './night-mode.css'
import './annotation.css'
import AnnotationLayer from './AnnotationLayer'

// Shared Document options — prevents re-parsing the PDF on every re-render
const PDF_OPTIONS = { cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/', cMapPacked: true }

// Use device pixel ratio for sharp rendering on high-DPI screens (retina, etc.)
const DEVICE_PIXEL_RATIO = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1

export default function PDFViewer({
  file, numPages, pageRefs, viewerRef, scale, rotation, readingMode,
  onLoad, onError, onScroll,
  // annotation props
  activeTool, activeColor, annotations, onAddAnnotation, onDeleteAnnotation, onUpdateAnnotation,
}) {
  const [documentError, setDocumentError] = useState('')
  const [renderedPages, setRenderedPages] = useState(() => new Set([1, 2]))
  // Per-page element refs for AnnotationLayer coordinate calculations
  const pageElRefs = useRef({})

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

  // Whether a text-selection based tool is active (affects cursor + pointer events)
  const isTextTool = activeTool && activeTool !== 'tick' && activeTool !== 'note'
  const isDropTool = activeTool === 'tick' || activeTool === 'note'
  const viewerClass = [
    'viewer',
    `reading-${readingMode}`,
    isDropTool ? 'tick-drop-mode' : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={viewerClass} ref={viewerRef} onScroll={handleScroll}>
      <div className="page-stack">
        {documentError ? (
          <div className="viewer-error">
            <AlertTriangle size={25} />
            <strong>Couldn't render this PDF</strong>
            <span>{documentError}</span>
            <small>Try another PDF or check whether it is password protected.</small>
          </div>
        ) : (
          <Document
            file={file}
            options={PDF_OPTIONS}
            onLoadSuccess={(result) => { setDocumentError(''); onLoad(result) }}
            onLoadError={handleError}
            loading={
              <div className="viewer-loading">
                <LoaderCircle className="spin" size={24} />
                <span>Preparing your document…</span>
              </div>
            }
          >
            {Array.from({ length: numPages }, (_, index) => {
              const page = index + 1
              const pageAnnotations = annotations?.[page] || []

              return (
                <div
                  className={`pdf-page ${renderedPages.has(page) ? '' : 'pdf-page-placeholder'} ${activeTool ? 'tool-active' : ''}`}
                  key={page}
                  ref={(node) => {
                    pageRefs.current[page] = node
                    pageElRefs.current[page] = node
                  }}
                  style={{ position: 'relative' }}
                >
                  {renderedPages.has(page) ? (
                    <>
                      <Page
                        pageNumber={page}
                        scale={scale}
                        rotate={rotation}
                        devicePixelRatio={DEVICE_PIXEL_RATIO}
                        renderTextLayer
                        renderAnnotationLayer
                        loading={<div className="page-loading"><LoaderCircle className="spin" size={18} /></div>}
                      />
                      <AnnotationLayer
                        page={page}
                        pageRef={{ current: pageElRefs.current[page] }}
                        annotations={pageAnnotations}
                        activeTool={activeTool}
                        activeColor={activeColor}
                        onAdd={onAddAnnotation}
                        onDelete={onDeleteAnnotation}
                        onUpdate={onUpdateAnnotation}
                        scale={scale}
                      />
                    </>
                  ) : (
                    <>
                      <div className="page-loading"><LoaderCircle className="spin" size={18} /></div>
                      {/* Still render stored annotations on unloaded pages */}
                      {pageAnnotations.length > 0 && (
                        <AnnotationLayer
                          page={page}
                          pageRef={{ current: pageElRefs.current[page] }}
                          annotations={pageAnnotations}
                          activeTool={null}
                          activeColor={null}
                          onAdd={onAddAnnotation}
                          onDelete={onDeleteAnnotation}
                          onUpdate={onUpdateAnnotation}
                          scale={scale}
                        />
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </Document>
        )}
      </div>
    </section>
  )
}
