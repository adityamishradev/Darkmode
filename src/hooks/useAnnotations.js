import { useCallback, useEffect, useRef, useState } from 'react'

// ── Storage helpers ────────────────────────────────────────────────────────
const storageKey = (file) => file ? `pdf-annotations-${file.name}-${file.size}` : null

function load(file) {
  const key = storageKey(file)
  if (!key) return {}
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

function save(file, data) {
  const key = storageKey(file)
  if (!key) return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

let _id = Date.now()
const newId = () => `ann-${++_id}`

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAnnotations(file) {
  const [annotations, setAnnotations] = useState(() => load(file))
  const [, bump] = useState(0)
  const fileRef = useRef(file)
  const undo$ = useRef([])
  const redo$ = useRef([])

  useEffect(() => {
    if (fileRef.current === file) return
    fileRef.current = file
    undo$.current = []
    redo$.current = []
    setAnnotations(load(file))
    bump((n) => n + 1)
  }, [file])

  const mutate = useCallback((updater) => {
    setAnnotations((prev) => {
      undo$.current = [...undo$.current, prev].slice(-100)
      redo$.current = []
      const next = updater(prev)
      save(fileRef.current, next)
      return next
    })
    bump((n) => n + 1)
  }, [])

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addAnnotation = useCallback((ann) => {
    const full = { ...ann, id: newId(), createdAt: Date.now() }
    mutate((prev) => ({ ...prev, [full.page]: [...(prev[full.page] || []), full] }))
    return full.id
  }, [mutate])

  const updateAnnotation = useCallback((id, changes) => {
    mutate((prev) => {
      const next = {}
      for (const [p, list] of Object.entries(prev))
        next[p] = list.map((a) => a.id === id ? { ...a, ...changes } : a)
      return next
    })
  }, [mutate])

  const deleteAnnotation = useCallback((id) => {
    mutate((prev) => {
      const next = {}
      for (const [p, list] of Object.entries(prev)) {
        const f = list.filter((a) => a.id !== id)
        if (f.length) next[p] = f
      }
      return next
    })
  }, [mutate])

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!undo$.current.length) return
    const prev = undo$.current[undo$.current.length - 1]
    undo$.current = undo$.current.slice(0, -1)
    setAnnotations((cur) => { redo$.current = [...redo$.current, cur]; save(fileRef.current, prev); return prev })
    bump((n) => n + 1)
  }, [])

  const redo = useCallback(() => {
    if (!redo$.current.length) return
    const next = redo$.current[redo$.current.length - 1]
    redo$.current = redo$.current.slice(0, -1)
    setAnnotations((cur) => { undo$.current = [...undo$.current, cur]; save(fileRef.current, next); return next })
    bump((n) => n + 1)
  }, [])

  const clearAll = useCallback(() => { mutate(() => ({})) }, [mutate])

  // ── Flat sorted list ──────────────────────────────────────────────────────
  const allAnnotations = Object.values(annotations).flat()
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
    canUndo: undo$.current.length > 0,
    canRedo: redo$.current.length > 0,
  }
}
