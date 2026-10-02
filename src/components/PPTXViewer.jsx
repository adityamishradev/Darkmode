import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { init } from 'pptx-preview'
import { useEffect, useRef, useState } from 'react'

export default function PPTXViewer({ fileUrl }) {
  const containerRef = useRef(null)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError('')
    setLoaded(false)
    if (!containerRef.current || !fileUrl) return undefined
    containerRef.current.replaceChildren()

    const loadPresentation = async () => {
      try {
        const response = await fetch(fileUrl)
        const buffer = await response.arrayBuffer()
        if (cancelled || !containerRef.current) return
        const previewer = init(containerRef.current, { width: 960, height: 540 })
        await previewer.preview(buffer)
        if (!cancelled) setLoaded(true)
      } catch (loadError) {
        if (!cancelled) setError(loadError?.message || 'This PowerPoint file could not be opened.')
      }
    }

    loadPresentation()
    return () => { cancelled = true; containerRef.current?.replaceChildren() }
  }, [fileUrl])

  if (error) return <section className="viewer pptx-viewer"><div className="viewer-error"><AlertTriangle size={25} /><strong>Could not render this PowerPoint</strong><span>{error}</span><small>Try another .pptx file or check whether it is password protected.</small></div></section>
  return <section className="viewer pptx-viewer"><div className="pptx-stage">{!loaded && <div className="pptx-loading"><LoaderCircle className="spin" size={24} /><span>Preparing your presentation...</span></div>}<div className="pptx-container" ref={containerRef} /></div></section>
}