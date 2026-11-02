import React from 'react'
import ReactDOM from 'react-dom/client'
import { pdfjs } from 'react-pdf'
import App from './App'
import './index.css'
import './upload-design.css'
import './responsive.css'
import { registerSW } from 'virtual:pwa-register'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
let updateSW
updateSW = registerSW({
	immediate: true,
	onNeedRefresh: () => window.dispatchEvent(new CustomEvent('pwa-update-available')),
})
window.__updatePWA = () => updateSW(true)

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
