import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pdf-ui-theme') || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('pdf-ui-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
