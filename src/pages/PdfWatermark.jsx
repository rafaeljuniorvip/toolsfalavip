import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Select from '../components/ui/Select'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, FileText } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import { PDFDocument, rgb, degrees as pdfDegrees } from 'pdf-lib'

const positionOptions = [
  { value: 'center', label: 'Centro' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'tile', label: 'Repetido' },
]

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return { r, g, b }
}

export default function PdfWatermark() {
  const [file, setFile] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [text, setText] = useState('CONFIDENCIAL')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(30)
  const [color, setColor] = useState('#999999')
  const [position, setPosition] = useState('diagonal')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const handleFiles = async ([f]) => {
    if (!f) return
    setFile(f)
    setResult(null)
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setTotalPages(pdf.getPageCount())
    } catch {}
  }

  const handleApply = async () => {
    if (!file || !text.trim()) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const font = await pdf.embedFont('Helvetica')
      const { r, g, b } = hexToRgb(color)

      for (const page of pdf.getPages()) {
        const { width, height } = page.getSize()

        if (position === 'tile') {
          const textWidth = font.widthOfTextAtSize(text, fontSize)
          const stepX = textWidth + 80
          const stepY = fontSize + 80
          for (let y = 0; y < height + stepY; y += stepY) {
            for (let x = -textWidth; x < width + textWidth; x += stepX) {
              page.drawText(text, {
                x, y,
                size: fontSize,
                font,
                color: rgb(r, g, b),
                opacity: opacity / 100,
                rotate: pdfDegrees(-30),
              })
            }
          }
        } else if (position === 'diagonal') {
          const textWidth = font.widthOfTextAtSize(text, fontSize)
          const angle = Math.atan2(height, width) * (180 / Math.PI)
          page.drawText(text, {
            x: (width - textWidth * Math.cos(angle * Math.PI / 180)) / 2,
            y: height / 2 - fontSize / 2,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity: opacity / 100,
            rotate: pdfDegrees(-angle),
          })
        } else {
          const textWidth = font.widthOfTextAtSize(text, fontSize)
          page.drawText(text, {
            x: (width - textWidth) / 2,
            y: (height - fontSize) / 2,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity: opacity / 100,
          })
        }
      }

      const pdfBytes = await pdf.save()
      setResult(new Blob([pdfBytes], { type: 'application/pdf' }))
    } catch {}
    setProcessing(false)
  }

  const resetAll = () => { setFile(null); setTotalPages(0); setResult(null) }

  return (
    <ToolPageLayout title="Marca d'Água em PDF" description="Adicione texto de marca d'água em páginas do PDF">
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
              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">Marca d'água aplicada!</p>
                  <p className="text-xs text-green-600 mt-1">Tamanho: {formatFileSize(result.size)}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Texto</label>
                <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="CONFIDENCIAL" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
              </div>
              <Select label="Posição" value={position} onChange={setPosition} options={positionOptions} />
              <Slider label="Tamanho" value={fontSize} onChange={setFontSize} min={12} max={120} unit="px" />
              <Slider label="Opacidade" value={opacity} onChange={setOpacity} min={5} max={100} unit="%" />
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Cor</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
              </div>
            </Card>

            <Button onClick={handleApply} disabled={processing || !text.trim()} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Aplicando...</> : 'Aplicar Marca d\'Água'}
            </Button>

            <DownloadButton blob={result} filename={`marca-dagua_${file?.name}`} />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
