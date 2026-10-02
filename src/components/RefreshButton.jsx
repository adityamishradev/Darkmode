import { RefreshCw } from 'lucide-react'

export default function RefreshButton() {
  return <button className="refresh-button" type="button" onClick={() => window.location.reload()} aria-label="Refresh page" title="Refresh page">
    <RefreshCw size={16} />
    <span>Refresh</span>
  </button>
}