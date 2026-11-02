import { useCallback, useEffect, useRef, useState } from 'react'

// ── Storage helpers ───────────────────────────────────────────────────────────
const storageKey = (file) =>
  file ? `pdf-annotations-${file.name}-${file.size}` : null

function loadAnnotations(file) {
  const key = storageKey(file)
  if (!key) return {}
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

function saveAnnotations(file, data) {
  const key = storageKey(file)
  if (!key) return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

// ── ID generator ──────────────────────────────────────────────────────────────
let _idCounter = Date.now()
const newId = () => `ann-${++_idCounter}`

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAnnotations(file) {
  const [annotations, setAnnotations] = useState(() => loadAnnotations(file))
  const fileRef = useRef(file)
  const undoStack = useRef([])
  const redoStack = useRef([])
  // Track re-render count to detect canUndo/canRedo changes
  const [, forceUpdate] = useState(0)

  // Reload when file changes
  useEffect(() => {
    if (fileRef.current === file) return
    fileRef.current = file
    undoStack.current = []
    redoStack.current = []
    setAnnotations(loadAnnotations(file))
    forceUpdate((n) => n + 1)
  }, [file])

  // ── Core mutate ───────────────────────────────────────────────────────────
  const mutate = useCallback((updater) => {
    setAnnotations((prev) => {
      undoStack.current = [...undoStack.current, prev].slice(-100)
      redoStack.current = []
      const next = updater(prev)
      saveAnnotations(fileRef.current, next)
      forceUpdate((n) => n + 1)
      return next
    })
  }, [])

  // ── Add ───────────────────────────────────────────────────────────────────
  const addAnnotation = useCallback((annotation) => {
    const ann = { ...annotation, id: newId(), createdAt: Date.now() }
    mutate((prev) => ({
      ...prev,
      [ann.page]: [...(prev[ann.page] || []), ann],
    }))
    return ann.id
  }, [mutate])

  // ── Update ────────────────────────────────────────────────────────────────
  const updateAnnotation = useCallback((id, changes) => {
    mutate((prev) => {
      const next = {}
      for (const [page, list] of Object.entries(prev)) {
        next[page] = list.map((a) => a.id === id ? { ...a, ...changes } : a)
      }
      return next
    })
  }, [mutate])

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteAnnotation = useCallback((id) => {
    mutate((prev) => {
      const next = {}
      for (const [page, list] of Object.entries(prev)) {
        const filtered = list.filter((a) => a.id !== id)
        if (filtered.length) next[page] = filtered
      }
      return next
    })
  }, [mutate])

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!undoStack.current.length) return
    const prev = undoStack.current[undoStack.current.length - 1]
    undoStack.current = undoStack.current.slice(0, -1)
    setAnnotations((current) => {
      redoStack.current = [...redoStack.current, current]
      saveAnnotations(fileRef.current, prev)
      forceUpdate((n) => n + 1)
      return prev
    })
  }, [])

  // ── Redo ──────────────────────────────────────────────────────────────────
  const redo = useCallback(() => {
    if (!redoStack.current.length) return
    const next = redoStack.current[redoStack.current.length - 1]
    redoStack.current = redoStack.current.slice(0, -1)
    setAnnotations((current) => {
      undoStack.current = [...undoStack.current, current]
      saveAnnotations(fileRef.current, next)
      forceUpdate((n) => n + 1)
      return next
    })
  }, [])

  // ── Clear all ─────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    mutate(() => ({}))
  }, [mutate])

  // ── Flat sorted list ──────────────────────────────────────────────────────
  const allAnnotations = Object.values(annotations)
    .flat()
    .sort((a, b) => (a.page - b.page) || (a.createdAt - b.createdAt))

  return {
    annotations,
    allAnnotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    undo,
    redo,
    clearAll,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  }
}
