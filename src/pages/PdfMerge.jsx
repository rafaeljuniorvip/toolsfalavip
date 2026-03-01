import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, GripVertical, X, FileText } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import { PDFDocument } from 'pdf-lib'

export default function PdfMerge() {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const handleFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
    setResult(null)
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const moveFile = (from, to) => {
    setFiles(prev => {
      const copy = [...prev]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)
      return copy
    })
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setProcessing(true)
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const bytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      setResult(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  const resetAll = () => {
    setFiles([])
    setResult(null)
  }

  return (
    <ToolPageLayout title="Juntar PDFs" description="Combine múltiplos PDFs em um único arquivo">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text">Arquivos ({files.length})</span>
              {files.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <RotateCcw size={14} /> Limpar
                </Button>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mb-4">
                {files.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col gap-0.5">
                      <button disabled={i === 0} onClick={() => moveFile(i, i - 1)} className="text-text-secondary hover:text-text disabled:opacity-30 cursor-pointer text-xs">▲</button>
                      <button disabled={i === files.length - 1} onClick={() => moveFile(i, i + 1)} className="text-text-secondary hover:text-text disabled:opacity-30 cursor-pointer text-xs">▼</button>
                    </div>
                    <FileText size={18} className="text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{file.name}</p>
                      <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-text-secondary hover:text-danger cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" multiple label="Arraste PDFs aqui ou clique para adicionar" />

            {result && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700">PDFs combinados com sucesso!</p>
                <p className="text-xs text-green-600 mt-1">Resultado: {formatFileSize(result.size)}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-sm text-text-secondary">
              Adicione 2 ou mais PDFs e ordene-os na sequência desejada. O processamento é feito localmente no seu navegador.
            </p>
          </Card>

          <Button onClick={handleMerge} disabled={processing || files.length < 2} className="w-full" size="lg">
            {processing ? <><LoadingSpinner size={18} /> Juntando...</> : `Juntar ${files.length} PDFs`}
          </Button>

          <DownloadButton blob={result} filename="pdfs-combinados.pdf" />
        </div>
      </div>
    </ToolPageLayout>
  )
}
