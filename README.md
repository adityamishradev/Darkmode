# PDF Reader

A browser-only PDF reader built with React, Vite, Tailwind CSS, React PDF, PDF.js, and `vite-plugin-pwa`.

## Features

- Open local PDFs with drag and drop
- Multi-page rendering with thumbnails
- Page navigation, zoom, rotate, fullscreen, print, and download
- Search text in the document with highlighting
- Bookmarks and last-page persistence
- Dark/light UI themes
- Original, sepia, and night reading modes
- Responsive desktop, tablet, and mobile controls
- Local processing only: files are never uploaded

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The PDF.js worker is bundled by Vite from `pdfjs-dist`, so the production build does not depend on a CDN worker.

The production build also generates `manifest.webmanifest`, `sw.js`, and precache assets. The service worker caches the application shell and static assets only. User-selected PDF files are local blob/File objects and are never added to the service worker cache.

## Test the PWA

1. **Install:** run `npm run dev`, open the app in Chrome or Edge, then use the address-bar install icon or the in-app `Install App` button when it appears.
2. **Offline:** load the app once, open DevTools > Application > Service Workers, enable Offline, and refresh. The app shell should load; local PDFs must be selected again because they are intentionally not cached.
3. **Service worker:** confirm `sw.js` is registered in DevTools > Application > Service Workers. For the production path, use `npm run build` followed by `npm run preview`.
4. **Manifest:** DevTools > Application > Manifest should show `PDF Reader`, `standalone`, dark theme/background colors, and the 192px/512px icons.
5. **Android:** open the HTTPS deployment in Chrome, choose Install app / Add to Home screen, launch it from the home screen, and verify standalone mode.
6. **Desktop/laptop:** use Chrome or Edge on HTTPS or localhost, install from the address bar, and launch the installed app window.

PDF processing remains completely local in the browser.
