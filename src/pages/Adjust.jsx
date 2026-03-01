import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import DownloadButton from '../components/shared/DownloadButton'
import { RotateCcw } from 'lucide-react'
import { formatFileSize, canvasToBlob } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

export default function Adjust() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturate, setSaturate] = useState(100)
  const [processing, setProcessing] = useState(false)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`

  const handleApply = async () => {
    if (!originalImage) return
    setProcessing(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = originalImage.naturalWidth
      canvas.height = originalImage.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.filter = filterString
      ctx.drawImage(originalImage, 0, 0)
      const blob = await canvasToBlob(canvas, originalFile?.type || 'image/png', 0.92)
      setProcessedBlob(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setSaturate(100)
  }

  return (
    <ToolPageLayout title="Ajustar Brilho / Contraste" description="Modifique brilho, contraste e saturação da imagem">
      {!originalImage ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text">Preview</span>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw size={14} /> Nova imagem
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                <img
                  src={originalImage.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain rounded"
                  style={{ filter: filterString }}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="space-y-4">
              <Slider label="Brilho" value={brightness} onChange={setBrightness} min={0} max={200} unit="%" />
              <Slider label="Contraste" value={contrast} onChange={setContrast} min={0} max={200} unit="%" />
              <Slider label="Saturação" value={saturate} onChange={setSaturate} min={0} max={200} unit="%" />
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Resetar valores
              </Button>
            </Card>

            <Button onClick={handleApply} disabled={processing} className="w-full" size="lg">
              Aplicar
            </Button>

            {processedBlob && (
              <Card>
                <p className="text-xs text-text-secondary">Tamanho: {formatFileSize(processedBlob.size)}</p>
              </Card>
            )}

            <DownloadButton blob={processedBlob} filename="ajustado.png" />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
