import { Page } from 'react-pdf'

const DEVICE_PIXEL_RATIO = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1

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
          devicePixelRatio={DEVICE_PIXEL_RATIO}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </span>
      <span>{String(page).padStart(2, '0')}</span>
    </button>
  )
}
