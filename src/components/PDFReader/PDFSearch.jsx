import { Search, X } from 'lucide-react'
import { useState } from 'react'

export default function PDFSearch({ onClose, onFind }) {
  const [query, setQuery] = useState('')
  return <div className="search-popover"><Search size={16} /><input autoFocus placeholder="Search in document" value={query} onChange={(event) => { setQuery(event.target.value); onFind(event.target.value) }} /><button className="icon-button small" onClick={onClose} aria-label="Close search"><X size={15} /></button></div>
}
