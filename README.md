# PDF Reader

A browser-only PDF reader built with React, Vite, Tailwind CSS, React PDF, and PDF.js.

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
