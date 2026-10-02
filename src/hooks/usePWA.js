import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pdf-pwa-install-dismissed'

export function usePWA() {
  const [installEvent, setInstallEvent] = useState(null)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [isInstalled, setIsInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault()
      if (localStorage.getItem(DISMISSED_KEY) !== 'true') setInstallEvent(event)
    }
    const handleInstalled = () => { setIsInstalled(true); setInstallEvent(null) }
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'dismissed') localStorage.setItem(DISMISSED_KEY, 'true')
    setInstallEvent(null)
  }

  return { canInstall: Boolean(installEvent) && !isInstalled, install, isOnline, isInstalled }
}
