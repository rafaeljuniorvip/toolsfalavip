import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import DownloadButton from '../components/shared/DownloadButton'
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react'
import { formatFileSize, canvasToBlob } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

export default function RotateFlip() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [processing, setProcessing] = useState(false)
  const previewRef = useRef(null)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const applyTransform = async () => {
    if (!originalImage) return
    setProcessing(true)
    try {
      const rad = (rotation * Math.PI) / 180
      const sin = Math.abs(Math.sin(rad))
      const cos = Math.abs(Math.cos(rad))
      const w = originalImage.naturalWidth
      const h = originalImage.naturalHeight
      const newW = Math.round(w * cos + h * sin)
      const newH = Math.round(w * sin + h * cos)

      const canvas = document.createElement('canvas')
      canvas.width = newW
      canvas.height = newH
      const ctx = canvas.getContext('2d')

      ctx.translate(newW / 2, newH / 2)
      ctx.rotate(rad)
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
      ctx.drawImage(originalImage, -w / 2, -h / 2)

      const blob = await canvasToBlob(canvas, originalFile?.type || 'image/png', 0.92)
      setProcessedBlob(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  const previewStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: 'transform 0.2s ease',
  }

  return (
    <ToolPageLayout title="Girar e Espelhar" description="Rotacione ou espelhe a imagem">
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
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
                <img
                  ref={previewRef}
                  src={originalImage.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain"
                  style={previewStyle}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Rotação rápida</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setRotation(r => r - 90)}>
                  <RotateCcw size={16} /> -90°
                </Button>
                <Button variant="secondary" onClick={() => setRotation(r => r + 90)}>
                  <RotateCw size={16} /> +90°
                </Button>
                <Button variant="secondary" onClick={() => setFlipH(!flipH)}>
                  <FlipHorizontal size={16} /> Espelhar H
                </Button>
                <Button variant="secondary" onClick={() => setFlipV(!flipV)}>
                  <FlipVertical size={16} /> Espelhar V
                </Button>
              </div>
            </Card>

            <Card>
              <Slider label="Rotação livre" value={rotation} onChange={setRotation} min={-180} max={180} unit="°" />
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setRotation(0); setFlipH(false); setFlipV(false) }}>
                Resetar
              </Button>
            </Card>

            <Button onClick={applyTransform} disabled={processing} className="w-full" size="lg">
              Aplicar
            </Button>

            {processedBlob && (
              <Card>
                <p className="text-xs text-slate-500">Tamanho: {formatFileSize(processedBlob.size)}</p>
              </Card>
            )}

            <DownloadButton blob={processedBlob} filename="girado.png" />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
