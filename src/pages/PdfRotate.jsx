import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, FileText } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import { PDFDocument, degrees } from 'pdf-lib'

const rotationOptions = [
  { value: '90', label: '90° (Horário)' },
  { value: '180', label: '180°' },
  { value: '270', label: '270° (Anti-horário)' },
]

export default function PdfRotate() {
  const [file, setFile] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [rotation, setRotation] = useState('90')
  const [applyTo, setApplyTo] = useState('all')
  const [specificPages, setSpecificPages] = useState('')
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
    } catch {
      // error
    }
  }

  const handleRotate = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const rot = parseInt(rotation)

      let pageIndices = []
      if (applyTo === 'all') {
        pageIndices = pdf.getPageIndices()
      } else {
        const parts = specificPages.split(',').map(s => s.trim())
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number)
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pageIndices.push(i - 1)
            }
          } else {
            const n = Number(part)
            if (n >= 1 && n <= totalPages) pageIndices.push(n - 1)
          }
        }
      }

      for (const idx of pageIndices) {
        const page = pdf.getPage(idx)
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + rot))
      }

      const pdfBytes = await pdf.save()
      setResult(new Blob([pdfBytes], { type: 'application/pdf' }))
    } catch {
      // error
    }
    setProcessing(false)
  }

  const resetAll = () => {
    setFile(null)
    setTotalPages(0)
    setResult(null)
  }

  return (
    <ToolPageLayout title="Girar PDF" description="Rotacione páginas de um documento PDF">
      {!file ? (
        <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" label="Arraste um arquivo PDF" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-text">Arquivo selecionado</span>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <RotateCcw size={14} /> Novo arquivo
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <FileText size={32} className="text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-text text-sm">{file.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {formatFileSize(file.size)} - {totalPages} página{totalPages !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">PDF rotacionado com sucesso!</p>
                  <p className="text-xs text-green-600 mt-1">Tamanho: {formatFileSize(result.size)}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <Select label="Rotação" value={rotation} onChange={setRotation} options={rotationOptions} />
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-text mb-3">Aplicar em</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="applyTo" value="all" checked={applyTo === 'all'} onChange={() => setApplyTo('all')} />
                  <span className="text-sm">Todas as páginas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="applyTo" value="specific" checked={applyTo === 'specific'} onChange={() => setApplyTo('specific')} />
                  <span className="text-sm">Páginas específicas</span>
                </label>
              </div>
              {applyTo === 'specific' && (
                <input
                  type="text"
                  value={specificPages}
                  onChange={e => setSpecificPages(e.target.value)}
                  placeholder="1, 3-5, 7"
                  className="w-full mt-2 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </Card>

            <Button onClick={handleRotate} disabled={processing} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Rotacionando...</> : 'Rotacionar'}
            </Button>

            <DownloadButton blob={result} filename={`rotacionado_${file?.name}`} />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
