import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DownloadButton from '../components/shared/DownloadButton'
import { RotateCcw } from 'lucide-react'
import { formatFileSize, canvasToBlob } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

const filters = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'grayscale', label: 'Preto e Branco', css: 'grayscale(100%)' },
  { id: 'sepia', label: 'Sépia', css: 'sepia(100%)' },
  { id: 'invert', label: 'Inverter', css: 'invert(100%)' },
  { id: 'blur', label: 'Desfoque', css: 'blur(3px)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(60%) contrast(120%) brightness(90%)' },
  { id: 'cool', label: 'Frio', css: 'hue-rotate(180deg) saturate(80%)' },
  { id: 'warm', label: 'Quente', css: 'sepia(30%) saturate(140%)' },
  { id: 'dramatic', label: 'Dramático', css: 'contrast(150%) brightness(80%) saturate(130%)' },
  { id: 'bright', label: 'Claro', css: 'brightness(130%) contrast(110%)' },
  { id: 'dark', label: 'Escuro', css: 'brightness(70%) contrast(120%)' },
  { id: 'retro', label: 'Retrô', css: 'sepia(40%) hue-rotate(-30deg) saturate(120%)' },
  { id: 'cinematic', label: 'Cinemático', css: 'contrast(130%) saturate(80%) brightness(90%) sepia(15%)' },
  { id: 'sunset', label: 'Pôr do Sol', css: 'sepia(20%) saturate(150%) hue-rotate(-15deg) brightness(105%)' },
  { id: 'ocean', label: 'Oceano', css: 'hue-rotate(200deg) saturate(120%) brightness(95%)' },
  { id: 'neon', label: 'Neon', css: 'contrast(150%) saturate(200%) brightness(110%)' },
  { id: 'noir', label: 'Noir', css: 'grayscale(100%) contrast(150%) brightness(80%)' },
  { id: 'pastel', label: 'Pastel', css: 'saturate(60%) brightness(120%) contrast(90%)' },
]

export default function Filters() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [activeFilter, setActiveFilter] = useState('none')
  const [processing, setProcessing] = useState(false)
  const [estimatedSize, setEstimatedSize] = useState(null)
  const estimateTimer = useRef(null)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const currentCss = filters.find(f => f.id === activeFilter)?.css || 'none'

  useEffect(() => {
    if (!originalImage) return
    clearTimeout(estimateTimer.current)
    estimateTimer.current = setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = originalImage.naturalWidth
        canvas.height = originalImage.naturalHeight
        const ctx = canvas.getContext('2d')
        if (currentCss !== 'none') ctx.filter = currentCss
        ctx.drawImage(originalImage, 0, 0)
        const blob = await canvasToBlob(canvas, originalFile?.type || 'image/png', 0.92)
        setEstimatedSize(blob.size)
      } catch { setEstimatedSize(null) }
    }, 300)
    return () => clearTimeout(estimateTimer.current)
  }, [originalImage, activeFilter])

  const handleApply = async () => {
    if (!originalImage) return
    setProcessing(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = originalImage.naturalWidth
      canvas.height = originalImage.naturalHeight
      const ctx = canvas.getContext('2d')
      if (currentCss !== 'none') ctx.filter = currentCss
      ctx.drawImage(originalImage, 0, 0)
      const blob = await canvasToBlob(canvas, originalFile?.type || 'image/png', 0.92)
      setProcessedBlob(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  return (
    <ToolPageLayout title="Filtros" description="Aplique filtros visuais à sua imagem">
      {!originalImage ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-800">Preview</span>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw size={14} /> Nova imagem
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                <img
                  src={originalImage.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain rounded"
                  style={{ filter: currentCss }}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Filtros</h3>
              <div className="grid grid-cols-3 gap-2">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer aspect-square
                      ${activeFilter === f.id ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-gray-300'}`}
                  >
                    <img
                      src={originalImage.src}
                      alt={f.label}
                      className="w-full h-full object-cover"
                      style={{ filter: f.css }}
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center">
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {estimatedSize && !processedBlob && (
              <Card>
                <p className="text-xs text-slate-500">Tamanho estimado: ~{formatFileSize(estimatedSize)}</p>
              </Card>
            )}

            <Button onClick={handleApply} disabled={processing} className="w-full" size="lg">
              Aplicar
            </Button>

            {processedBlob && (
              <Card>
                <p className="text-xs text-slate-500">Tamanho: {formatFileSize(processedBlob.size)}</p>
              </Card>
            )}

            <DownloadButton blob={processedBlob} filename="filtro.png" />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
