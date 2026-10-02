import { useCallback, useEffect, useRef, useState } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const MAX_PDF_SIZE = 500 * 1024 * 1024

export function usePDFReader() {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(() => Number(localStorage.getItem('pdf-last-page')) || 1)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [readingMode, setReadingMode] = useState(() => localStorage.getItem('pdf-reading-mode') || 'original')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('pdf-bookmarks') || '[]'))
  const viewerRef = useRef(null)
  const pageRefs = useRef({})

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl) }, [fileUrl])
  useEffect(() => localStorage.setItem('pdf-reading-mode', readingMode), [readingMode])
  useEffect(() => localStorage.setItem('pdf-bookmarks', JSON.stringify(bookmarks)), [bookmarks])

  const openFile = useCallback((nextFile) => {
    const isPdf = nextFile && (nextFile.type === 'application/pdf' || nextFile.name?.toLowerCase().endsWith('.pdf'))
    if (!isPdf) { setError('Please choose a valid PDF file.'); return }
    if (nextFile.size > MAX_PDF_SIZE) { setError('PDF files must be 500 MB or smaller.'); return }
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    setError(''); setIsLoading(true); setFile(nextFile); setFileUrl(URL.createObjectURL(nextFile)); setPageNumber(1); setRotation(0)
  }, [fileUrl])
  const onDocumentLoad = useCallback(({ numPages: total }) => {
    const savedPage = Number(localStorage.getItem('pdf-last-page')) || 1
    setNumPages(total)
    setPageNumber(clamp(savedPage, 1, total))
    setIsLoading(false)
  }, [])
  const goToPage = useCallback((nextPage) => {
    const target = clamp(Number(nextPage) || 1, 1, numPages || 1)
    setPageNumber(target)
    pageRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [numPages])
  const changeZoom = useCallback((delta) => setScale((current) => clamp(Number((current + delta).toFixed(2)), 0.5, 3)), [])
  const toggleBookmark = useCallback((page = pageNumber) => setBookmarks((current) => current.includes(page) ? current.filter((item) => item !== page) : [...current, page].sort((a, b) => a - b)), [pageNumber])
  const onViewerScroll = useCallback(() => {
    const container = viewerRef.current
    if (!container || !numPages) return
    let closestPage = pageNumber
    let closestDistance = Infinity
    Object.entries(pageRefs.current).forEach(([page, node]) => {
      if (!node) return
      const distance = Math.abs(node.getBoundingClientRect().top - container.getBoundingClientRect().top - 24)
      if (distance < closestDistance) { closestDistance = distance; closestPage = Number(page) }
    })
    if (closestPage !== pageNumber) { setPageNumber(closestPage); localStorage.setItem('pdf-last-page', String(closestPage)) }
  }, [numPages, pageNumber])
  const fitWidth = useCallback(() => {
    const width = viewerRef.current?.clientWidth || 900
    setScale(clamp((width - 80) / 816, 0.5, 3))
  }, [])
  const fitPage = useCallback(() => setScale(1), [])

  return { file, fileUrl, numPages, pageNumber, scale, rotation, readingMode, error, isLoading, bookmarks, viewerRef, pageRefs, openFile, onDocumentLoad, setPageNumber: goToPage, changeZoom, setRotation, setReadingMode, toggleBookmark, onViewerScroll, fitWidth, fitPage, setError }
}
