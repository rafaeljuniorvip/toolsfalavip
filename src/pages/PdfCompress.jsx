import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, FileDown } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'

const levels = [
  { value: 'screen', label: 'Máxima compressão', desc: 'Menor tamanho, qualidade baixa (72 dpi)' },
  { value: 'ebook', label: 'Compressão média', desc: 'Bom equilíbrio tamanho/qualidade (150 dpi)' },
  { value: 'printer', label: 'Alta qualidade', desc: 'Pouca redução, ótima qualidade (300 dpi)' },
]

export default function PdfCompress() {
  const [file, setFile] = useState(null)
  const [level, setLevel] = useState('ebook')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFiles = ([f]) => {
    if (f) {
      setFile(f)
      setResult(null)
      setError(null)
    }
  }

  const handleCompress = async () => {
    if (!file) return
    setProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('level', level)

      const res = await fetch('/api/pdf/compress', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao comprimir')
      }
      const blob = await res.blob()
      setResult(blob)
    } catch (err) {
      setError(err.message)
    }
    setProcessing(false)
  }

  const resetAll = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <ToolPageLayout title="Comprimir PDF" description="Reduza o tamanho de arquivos PDF com Ghostscript">
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
                  <FileDown size={32} className="text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-text text-sm">{file.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Tamanho: {formatFileSize(file.size)}</p>
                </div>
              </div>
              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    Comprimido com sucesso!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {formatFileSize(file.size)} → {formatFileSize(result.size)}
                    {' '}({Math.round((1 - result.size / file.size) * 100)}% de redução)
                  </p>
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-text mb-3">Nível de compressão</h3>
              <div className="space-y-2">
                {levels.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer
                      ${level === l.value
                        ? 'border-primary bg-primary-light/50 text-primary'
                        : 'border-border hover:bg-gray-50'
                      }`}
                  >
                    <p className="text-sm font-medium">{l.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{l.desc}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Button onClick={handleCompress} disabled={processing} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Comprimindo...</> : 'Comprimir'}
            </Button>

            <DownloadButton blob={result} filename={`comprimido_${file.name}`} />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
