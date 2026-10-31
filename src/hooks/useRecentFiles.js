import { useState, useCallback } from 'react'

const STORAGE_KEY = 'pdf-recent-files'
const MAX_RECENT = 10

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState(loadRecent)

  const addRecentFile = useCallback((file) => {
    const entry = {
      name: file.name,
      size: file.size,
      type: file.name.toLowerCase().endsWith('.pptx') ? 'pptx' : 'pdf',
      openedAt: Date.now(),
    }
    setRecentFiles((prev) => {
      // Remove duplicate (same name), add new at top, limit to MAX_RECENT
      const updated = [entry, ...prev.filter((f) => f.name !== entry.name)].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { recentFiles, addRecentFile }
}
