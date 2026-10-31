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

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
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
      const updated = [entry, ...prev.filter((f) => f.name !== entry.name)].slice(0, MAX_RECENT)
      return save(updated)
    })
  }, [])

  const deleteRecentFile = useCallback((name) => {
    setRecentFiles((prev) => save(prev.filter((f) => f.name !== name)))
  }, [])

  const renameRecentFile = useCallback((oldName, newName) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return
    setRecentFiles((prev) => {
      const updated = prev.map((f) =>
        f.name === oldName ? { ...f, name: trimmed } : f
      )
      return save(updated)
    })
  }, [])

  return { recentFiles, addRecentFile, deleteRecentFile, renameRecentFile }
}
