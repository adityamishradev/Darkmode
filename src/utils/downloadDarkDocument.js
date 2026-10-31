import { jsPDF } from 'jspdf'
import { pdfjs } from 'react-pdf'

const loadImage = (source) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = source
})

const renderElement = async (element) => {
  if (element instanceof HTMLCanvasElement) return element
  const source = element instanceof SVGElement
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(element))}`
    : element.currentSrc || element.src
  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height
  canvas.getContext('2d').drawImage(image, 0, 0)
  return canvas
}

const darkenCanvas = (source) => {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const context = canvas.getContext('2d')
  context.drawImage(source, 0, 0)
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < image.data.length; index += 4) {
    image.data[index] = 255 - image.data[index]
    image.data[index + 1] = 255 - image.data[index + 1]
    image.data[index + 2] = 255 - image.data[index + 2]
  }
  context.putImageData(image, 0, 0)
  return canvas
}

const renderPdfPages = async () => {
  const file = window.__pdfReaderFile
  if (!file) throw new Error('Open a PDF before downloading its dark version.')
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const pages = []
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    pages.push(darkenCanvas(canvas))
  }
  return pages
}

export async function downloadDarkDocument({ fileName, isPptx }) {
  const pages = isPptx
    ? await Promise.all([...document.querySelectorAll('.pptx-container canvas, .pptx-container svg, .pptx-container img')].map(async (element) => darkenCanvas(await renderElement(element))))
    : await renderPdfPages()
  if (!pages.length) throw new Error('Wait for the document to finish rendering, then try again.')

  const first = pages[0]
  const pdf = new jsPDF({ orientation: first.width > first.height ? 'landscape' : 'portrait', unit: 'pt', format: [first.width, first.height] })
  pages.forEach((page, index) => {
    if (index) pdf.addPage([page.width, page.height], page.width > page.height ? 'landscape' : 'portrait')
    pdf.addImage(page.toDataURL('image/png'), 'PNG', 0, 0, page.width, page.height, undefined, 'FAST')
  })
  pdf.save(`${fileName.replace(/\.(pdf|pptx)$/i, '')}-dark.pdf`)
}