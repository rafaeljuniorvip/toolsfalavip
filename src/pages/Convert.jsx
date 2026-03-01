import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Slider from '../components/ui/Slider'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw } from 'lucide-react'
import { formatFileSize, canvasToBlob, getMimeType } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

const formats = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'bmp', label: 'BMP' },
]

export default function Convert() {
  const { originalFile, originalImage, processedBlob, loadImage, imageToCanvas, setProcessedBlob, reset } = useImageProcessor()
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(92)
  const [processing, setProcessing] = useState(false)
  const [estimatedSize, setEstimatedSize] = useState(null)
  const estimateTimer = useRef(null)

  const isLossy = format === 'jpg' || format === 'webp'

  useEffect(() => {
    if (!originalImage) return
    clearTimeout(estimateTimer.current)
    estimateTimer.current = setTimeout(async () => {
      try {
        const canvas = imageToCanvas(originalImage)
        const mime = getMimeType(format)
        const blob = await canvasToBlob(canvas, mime, isLossy ? quality / 100 : undefined)
        setEstimatedSize(blob.size)
      } catch { setEstimatedSize(null) }
    }, 300)
    return () => clearTimeout(estimateTimer.current)
  }, [originalImage, format, quality])

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const handleConvert = async () => {
    if (!originalImage) return
    setProcessing(true)
    try {
      const canvas = imageToCanvas(originalImage)
      const mime = getMimeType(format)
      const blob = await canvasToBlob(canvas, mime, isLossy ? quality / 100 : undefined)
      setProcessedBlob(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  return (
    <ToolPageLayout title="Converter Formato" description="Converta imagens entre PNG, JPG, WebP e BMP">
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
                <img src={originalImage.src} alt="Preview" className="max-w-full max-h-[500px] object-contain rounded" />
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>Original: {originalFile.name} ({formatFileSize(originalFile.size)})</span>
                {processedBlob && (
                  <span className="text-blue-600 font-medium">
                    Convertido: .{format} ({formatFileSize(processedBlob.size)})
                  </span>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <Select label="Formato de saída" value={format} onChange={setFormat} options={formats} />
            </Card>

            {isLossy && (
              <Card>
                <Slider label="Qualidade" value={quality} onChange={setQuality} min={10} max={100} unit="%" />
              </Card>
            )}

            {estimatedSize && (
              <Card>
                <p className="text-xs text-slate-500">Tamanho estimado: ~{formatFileSize(estimatedSize)}</p>
              </Card>
            )}

            <Button onClick={handleConvert} disabled={processing} className="w-full" size="lg">
              {processing ? <LoadingSpinner size={18} /> : 'Converter'}
            </Button>

            <DownloadButton blob={processedBlob} filename={`convertido.${format}`} />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
