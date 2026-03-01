import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, ChevronUp, ChevronDown, X, FileText } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import { PDFDocument } from 'pdf-lib'

export default function PdfReorder() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const handleFiles = async ([f]) => {
    if (!f) return
    setFile(f)
    setResult(null)
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const count = pdf.getPageCount()
      setPages(Array.from({ length: count }, (_, i) => ({
        originalIndex: i,
        label: `Página ${i + 1}`,
      })))
    } catch {}
  }

  const movePage = (from, to) => {
    setPages(prev => {
      const copy = [...prev]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)
      return copy
    })
    setResult(null)
  }

  const removePage = (index) => {
    setPages(prev => prev.filter((_, i) => i !== index))
    setResult(null)
  }

  const handleReorder = async () => {
    if (!file || pages.length === 0) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(bytes)
      const newPdf = await PDFDocument.create()
      const indices = pages.map(p => p.originalIndex)
      const copiedPages = await newPdf.copyPages(srcPdf, indices)
      copiedPages.forEach(p => newPdf.addPage(p))
      const pdfBytes = await newPdf.save()
      setResult(new Blob([pdfBytes], { type: 'application/pdf' }))
    } catch {}
    setProcessing(false)
  }

  const resetAll = () => { setFile(null); setPages([]); setResult(null) }

  return (
    <ToolPageLayout title="Reordenar Páginas PDF" description="Altere a ordem das páginas de um PDF">
      {!file ? (
        <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" label="Arraste um arquivo PDF" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-800">Páginas ({pages.length})</span>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <RotateCcw size={14} /> Novo arquivo
                </Button>
              </div>
              <div className="space-y-2">
                {pages.map((page, i) => (
                  <div key={`${page.originalIndex}-${i}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">{i + 1}</span>
                    <FileText size={18} className="text-red-500 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-slate-800">{page.label}</span>
                    <div className="flex items-center gap-1">
                      <button disabled={i === 0} onClick={() => movePage(i, i - 1)} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 cursor-pointer">
                        <ChevronUp size={16} />
                      </button>
                      <button disabled={i === pages.length - 1} onClick={() => movePage(i, i + 1)} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 cursor-pointer">
                        <ChevronDown size={16} />
                      </button>
                      <button onClick={() => removePage(i)} className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600 cursor-pointer">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">PDF reordenado!</p>
                  <p className="text-xs text-green-600 mt-1">Tamanho: {formatFileSize(result.size)}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <p className="text-sm text-slate-500">
                Use as setas para mover páginas para cima ou para baixo. Clique no X para remover uma página.
              </p>
            </Card>

            <Button onClick={handleReorder} disabled={processing || pages.length === 0} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Gerando...</> : 'Gerar PDF'}
            </Button>

            <DownloadButton blob={result} filename={`reordenado_${file?.name}`} />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
