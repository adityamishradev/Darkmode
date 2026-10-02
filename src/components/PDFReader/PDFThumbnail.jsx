import { Document, Page } from 'react-pdf'

export default function PDFThumbnail({ fileUrl, page, selected, onSelect }) {
  return <button className={`thumbnail ${selected ? 'selected' : ''}`} onClick={() => onSelect(page)} aria-label={`Go to page ${page}`}><span className="thumbnail-page"><Document file={fileUrl}><Page pageNumber={page} width={100} renderTextLayer={false} renderAnnotationLayer={false} /></Document></span><span>{String(page).padStart(2, '0')}</span></button>
}
