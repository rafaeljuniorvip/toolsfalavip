import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, FileText } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import { PDFDocument } from 'pdf-lib'

export default function PdfSplit() {
  const [file, setFile] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [rangeInput, setRangeInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])

  const handleFiles = async ([f]) => {
    if (!f) return
    setFile(f)
    setResults([])
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setTotalPages(pdf.getPageCount())
      setRangeInput(`1-${pdf.getPageCount()}`)
    } catch {
      // error
    }
  }

  const parseRanges = (input) => {
    const ranges = []
    const parts = input.split(',').map(s => s.trim())
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
          ranges.push({ start: start - 1, end: end - 1 })
        }
      } else {
        const n = Number(part)
        if (!isNaN(n) && n >= 1 && n <= totalPages) {
          ranges.push({ start: n - 1, end: n - 1 })
        }
      }
    }
    return ranges
  }

  const handleSplit = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(bytes)
      const ranges = parseRanges(rangeInput)
      const blobs = []

      for (const range of ranges) {
        const newPdf = await PDFDocument.create()
        const indices = []
        for (let i = range.start; i <= range.end; i++) indices.push(i)
        const pages = await newPdf.copyPages(srcPdf, indices)
        pages.forEach(p => newPdf.addPage(p))
        const pdfBytes = await newPdf.save()
        const label = range.start === range.end
          ? `pagina_${range.start + 1}.pdf`
          : `paginas_${range.start + 1}-${range.end + 1}.pdf`
        blobs.push({ blob: new Blob([pdfBytes], { type: 'application/pdf' }), label })
      }

      setResults(blobs)
    } catch {
      // error
    }
    setProcessing(false)
  }

  const resetAll = () => {
    setFile(null)
    setTotalPages(0)
    setResults([])
    setRangeInput('')
  }

  return (
    <ToolPageLayout title="Dividir PDF" description="Separe páginas ou intervalos de um PDF">
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

              {results.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-green-700">Arquivos gerados:</p>
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-600" />
                        <span className="text-sm text-green-700">{r.label}</span>
                        <span className="text-xs text-green-600">({formatFileSize(r.blob.size)})</span>
                      </div>
                      <DownloadButton blob={r.blob} filename={r.label} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-text mb-2">Páginas para extrair</h3>
              <p className="text-xs text-text-secondary mb-3">
                Use vírgulas para separar e hífens para intervalos. Ex: 1-3, 5, 7-10
              </p>
              <input
                type="text"
                value={rangeInput}
                onChange={e => setRangeInput(e.target.value)}
                placeholder="1-3, 5, 7-10"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-text-secondary mt-2">Total: {totalPages} páginas</p>
            </Card>

            <Button onClick={handleSplit} disabled={processing || !rangeInput.trim()} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Dividindo...</> : 'Dividir'}
            </Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
