import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, FileText, Download } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href

const dpiOptions = [
  { value: '1', label: '72 DPI (Rápido)' },
  { value: '2', label: '150 DPI (Médio)' },
  { value: '4', label: '300 DPI (Alta qualidade)' },
]

const formatOptions = [
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpeg', label: 'JPG' },
]

export default function PdfToImages() {
  const [file, setFile] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState('2')
  const [format, setFormat] = useState('image/png')
  const [processing, setProcessing] = useState(false)
  const [images, setImages] = useState([])

  const handleFiles = async ([f]) => {
    if (!f) return
    setFile(f)
    setImages([])
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
      setTotalPages(pdf.numPages)
    } catch {}
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
      const results = []
      const scaleNum = parseFloat(scale)

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: scaleNum })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.92))
        results.push({
          blob,
          url: URL.createObjectURL(blob),
          label: `pagina_${i}.${format === 'image/png' ? 'png' : 'jpg'}`,
        })
      }
      setImages(results)
    } catch {}
    setProcessing(false)
  }

  const downloadSingle = (img) => {
    const a = document.createElement('a')
    a.href = img.url
    a.download = img.label
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadZip = async () => {
    const zip = new JSZip()
    for (const img of images) {
      zip.file(img.label, img.blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = 'pdf-imagens.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }

  const resetAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.url))
    setFile(null); setTotalPages(0); setImages([])
  }

  return (
    <ToolPageLayout title="PDF para Imagens" description="Converta páginas do PDF em imagens PNG ou JPG">
      {!file ? (
        <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" label="Arraste um arquivo PDF" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-800">Arquivo selecionado</span>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <RotateCcw size={14} /> Novo arquivo
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-lg"><FileText size={32} className="text-red-500" /></div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(file.size)} - {totalPages} página{totalPages !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white">
                      <img src={img.url} alt={img.label} className="w-full aspect-[3/4] object-contain p-1" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button onClick={() => downloadSingle(img)} className="p-2 bg-white rounded-lg shadow cursor-pointer">
                          <Download size={16} />
                        </button>
                      </div>
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center">{img.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <Select label="Qualidade" value={scale} onChange={setScale} options={dpiOptions} />
            </Card>
            <Card>
              <Select label="Formato" value={format} onChange={setFormat} options={formatOptions} />
            </Card>

            <Button onClick={handleConvert} disabled={processing} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Convertendo...</> : 'Converter'}
            </Button>

            {images.length > 0 && (
              <Button onClick={downloadZip} className="w-full" size="lg">
                <Download size={18} /> Baixar tudo (ZIP)
              </Button>
            )}
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
