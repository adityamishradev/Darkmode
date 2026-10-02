import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    strategies: 'generateSW',
    filename: 'sw.js',
    injectRegister: 'auto',
    includeAssets: ['icons/*.svg'],
    manifest: {
      name: 'PDF Reader',
      short_name: 'PDF Reader',
      description: 'A private, local-first PDF reader for viewing documents in your browser.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      theme_color: '#101012',
      background_color: '#101012',
      lang: 'en',
      icons: [
        { src: '/icons/pdf-reader-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
        { src: '/icons/pdf-reader-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        { src: '/icons/pdf-reader-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
      ],
    },
    workbox: {
      cleanupOutdatedCaches: true,
      navigateFallback: '/index.html',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mjs}'],
      runtimeCaching: [],
    },
  })],
})
