import { Page } from 'react-pdf'

export default function PDFThumbnail({ page, selected, onSelect }) {
  return (
    <button
      className={`thumbnail ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(page)}
      aria-label={`Go to page ${page}`}
    >
      <span className="thumbnail-page">
        <Page
          pageNumber={page}
          width={100}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </span>
      <span>{String(page).padStart(2, '0')}</span>
    </button>
  )
}
