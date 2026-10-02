import { Download, Wifi, WifiOff } from 'lucide-react'

export default function PWAStatus({ canInstall, onInstall, isOnline }) {
  return <div className="pwa-status"><span className={isOnline ? 'online-status' : 'offline-status'} title={isOnline ? 'Online' : 'Offline'}>{isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}<span>{isOnline ? 'Online' : 'Offline'}</span></span>{canInstall && <button className="install-button" onClick={onInstall}><Download size={14} /> Install App</button>}</div>
}
