import { Download, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PWAStatus({ canInstall, onInstall, isOnline }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true)
    window.addEventListener('pwa-update-available', handleUpdate)
    return () => window.removeEventListener('pwa-update-available', handleUpdate)
  }, [])
  const updateApp = async () => {
    setUpdateAvailable(false)
    await window.__updatePWA?.()
    window.location.reload()
  }
  return <div className="pwa-status"><span className={isOnline ? 'online-status' : 'offline-status'} title={isOnline ? 'Online' : 'Offline'}>{isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}<span>{isOnline ? 'Online' : 'Offline'}</span></span>{updateAvailable && <button className="update-button" onClick={updateApp} title="Update app"><RefreshCw size={14} /> Update</button>}{canInstall && <button className="install-button" onClick={onInstall}><Download size={14} /> Install App</button>}</div>
}
