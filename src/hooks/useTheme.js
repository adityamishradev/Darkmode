import { useEffect, useRef, useState } from 'react'

const getSystemTheme = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export function useTheme() {
  const manuallySelected = useRef(Boolean(localStorage.getItem('pdf-ui-theme')))
  const [theme, setTheme] = useState(() => localStorage.getItem('pdf-ui-theme') || getSystemTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery || manuallySelected.current) return undefined
    const handleSystemThemeChange = (event) => setTheme(event.matches ? 'dark' : 'light')
    mediaQuery.addEventListener?.('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener?.('change', handleSystemThemeChange)
  }, [])

  const selectTheme = (nextTheme) => {
    manuallySelected.current = true
    localStorage.setItem('pdf-ui-theme', nextTheme)
    setTheme(nextTheme)
  }

  return { theme, setTheme: selectTheme }
}
