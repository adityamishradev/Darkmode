# PDF Reader

Production-ready, browser-only PDF reader built with React, Vite, Tailwind CSS, React PDF, PDF.js, Lucide React, and `vite-plugin-pwa`.

Files are processed locally in the browser. No selected PDF is uploaded to a server and user PDF files are not added to the service worker cache.

## Features

- Open local PDF files from the file picker or drag and drop
- Accept PDF files up to 500 MB
- PDF.js multi-page rendering with thumbnails
- Page navigation, direct page jump, zoom, fit width, fit page, and rotation
- Search text with highlighting
- Bookmarks and last-page persistence
- Print, download, and fullscreen controls
- Dark/light application themes
- Original, sepia, and night PDF reading modes
- Responsive desktop, laptop, tablet, and mobile layouts
- PWA install button, offline indicator, and offline application shell
- Native OS PDF file association on supported installed PWAs

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A modern browser such as Chrome, Edge, Firefox, or Safari

PWA installation, service workers, and OS file associations require `localhost` or HTTPS. Opening the built HTML directly with `file://` does not provide full PWA behavior.

## Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To test from a phone on the same Wi-Fi network, use the Network URL printed by Vite, for example:

```text
http://10.243.148.254:5173/
```

The phone and computer must be on the same network, and Windows Firewall must allow Node.js if it prompts.

## Production build

```bash
npm run build
npm run preview
```

The build generates:

- `dist/index.html`
- `dist/manifest.webmanifest`
- `dist/sw.js`
- `dist/workbox-*.js`
- Bundled application and PDF.js worker assets

The PDF.js worker is bundled locally by Vite. The service worker precaches the application shell and static assets only. User-selected PDF files and blob URLs are not cached.

## OS-level PDF opening

The generated Web App Manifest includes this file handler:

```json
{
  "file_handlers": [
    {
      "action": "/",
      "accept": {
        "application/pdf": [".pdf"]
      }
    }
  ]
}
```

On supported platforms, the flow is:

```text
OS PDF
  -> installed PDF Reader PWA
  -> launchQueue
  -> FileSystemFileHandle.getFile()
  -> existing usePDFReader().openFile(file)
  -> existing PDF.js viewer
```

The implementation handles the first supported PDF when the operating system sends multiple files. Unsupported file types are ignored. Normal file picker and drag-and-drop flows continue to use the same existing `openFile` function.

### Cold start

The `launchQueue` consumer is registered during root `App` initialization. The browser holds launch parameters until a consumer is registered, so a supported installed browser can deliver the PDF when the PWA starts from a completely closed state.

### Browser and platform support

- Chromium-based Android installed PWAs may expose PDF file association support when the browser and OS version support the File Handling API.
- Chromium desktop installed PWAs may expose the same `Open with` integration.
- Firefox and Safari may not expose `launchQueue` or OS file associations. The app detects this safely and normal upload/import continues to work.
- Android and desktop installation generally require HTTPS, except for local `localhost` development.
- The browser and operating system decide whether the installed PWA appears in `Open with`; the app cannot force that registration.

## PWA testing

### Install

1. Run `npm run dev`, or run `npm run build` followed by `npm run preview`.
2. Open the app in Chrome or Edge on `localhost` or HTTPS.
3. Use the browser install icon or the in-app `Install App` button.
4. Launch the installed app from the operating system or Android home screen.

### Offline

1. Load the app once while online.
2. Open DevTools > Application > Service Workers.
3. Enable Offline and refresh.
4. Confirm that the app shell loads.

Local PDFs must be selected again after a full refresh because they are intentionally not cached.

### Manifest and service worker

In DevTools > Application, verify:

- Manifest name: `PDF Reader`
- Display mode: `standalone`
- Dark theme/background colors
- 192px, 512px, and maskable icons
- `file_handlers` with PDF acceptance
- Active `sw.js`

### OS file opening

1. Install the PWA from a supported Chromium browser.
2. Confirm the OS offers PDF Reader in the PDF file's **Open with** list.
3. Choose PDF Reader for a local PDF.
4. Confirm the installed PWA launches and the existing viewer opens the PDF.
5. Repeat with the PWA already open and completely closed.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Left arrow | Previous page |
| Right arrow | Next page |
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `Ctrl/Cmd + F` | Search the document |
| `F` | Toggle fullscreen |
| `Escape` | Close search or exit fullscreen |
| `Home` | First page |
| `End` | Last page |

## Project structure

```text
src/
├── components/
│   ├── PDFReader/
│   ├── PWAStatus.jsx
│   ├── ThemeToggle.jsx
│   └── UploadArea.jsx
├── hooks/
│   ├── useKeyboardShortcuts.js
│   ├── usePDFReader.js
│   ├── usePWA.js
│   └── useTheme.js
├── App.jsx
├── index.css
└── main.jsx
```

PWA configuration is in `vite.config.js`. PWA icons are in `public/icons/`.

## Limitations

- The reader renders PDF files only. PPT/PPTX files must be converted to PDF first.
- A 500 MB upload limit protects browser memory and rendering performance.
- Very large or image-heavy PDFs can still use substantial device memory.
- PDF files are not persisted in localStorage or the service worker cache.

## Deployment

Deploy the contents of `dist/` to a static HTTPS host. Preserve `sw.js`, `manifest.webmanifest`, icon files, and Workbox assets. Configure the host to serve `index.html` for SPA navigation.

Repository: https://github.com/adityamishradev/Darkmode
