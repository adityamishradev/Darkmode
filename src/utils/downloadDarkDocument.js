import { jsPDF } from 'jspdf'

const NIGHT_FILTER = 'invert(88%) hue-rotate(180deg) brightness(82%) contrast(94%)'

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
  context.filter = NIGHT_FILTER
  context.drawImage(source, 0, 0)
  return canvas
}

export async function downloadDarkDocument({ fileName, isPptx }) {
  const selector = isPptx
    ? '.pptx-container canvas, .pptx-container svg, .pptx-container img'
    : '.pdf-page canvas'
  const elements = [...document.querySelectorAll(selector)]
  if (!elements.length) throw new Error('Wait for the document to finish rendering, then try again.')

  const pages = []
  for (const element of elements) pages.push(darkenCanvas(await renderElement(element)))

  const first = pages[0]
  const pdf = new jsPDF({ orientation: first.width > first.height ? 'landscape' : 'portrait', unit: 'pt', format: [first.width, first.height] })
  pages.forEach((page, index) => {
    if (index) pdf.addPage([page.width, page.height], page.width > page.height ? 'landscape' : 'portrait')
    pdf.addImage(page.toDataURL('image/png'), 'PNG', 0, 0, page.width, page.height, undefined, 'FAST')
  })
  pdf.save(`${fileName.replace(/\.(pdf|pptx)$/i, '')}-dark.pdf`)
}