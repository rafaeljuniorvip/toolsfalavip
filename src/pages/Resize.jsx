import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Lock, Unlock, RotateCcw } from 'lucide-react'
import { formatFileSize, canvasToBlob, getMimeType } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'
import imageCompression from 'browser-image-compression'

export default function Resize() {
  const { originalFile, originalImage, processedBlob, isProcessing, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lockRatio, setLockRatio] = useState(true)
  const [quality, setQuality] = useState(85)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [estimatedSize, setEstimatedSize] = useState(null)
  const estimateTimer = useRef(null)

  useEffect(() => {
    if (originalImage) {
      setWidth(originalImage.naturalWidth)
      setHeight(originalImage.naturalHeight)
      setAspectRatio(originalImage.naturalWidth / originalImage.naturalHeight)
    }
  }, [originalImage])

  useEffect(() => {
    if (!originalImage || !width || !height) return
    clearTimeout(estimateTimer.current)
    estimateTimer.current = setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(originalImage, 0, 0, width, height)
        const blob = await canvasToBlob(canvas, originalFile?.type === 'image/png' ? 'image/png' : 'image/jpeg', quality / 100)
        setEstimatedSize(blob.size)
      } catch { setEstimatedSize(null) }
    }, 300)
    return () => clearTimeout(estimateTimer.current)
  }, [originalImage, width, height, quality])

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const handleWidthChange = (val) => {
    const w = Math.max(1, parseInt(val) || 0)
    setWidth(w)
    if (lockRatio) setHeight(Math.round(w / aspectRatio))
  }

  const handleHeightChange = (val) => {
    const h = Math.max(1, parseInt(val) || 0)
    setHeight(h)
    if (lockRatio) setWidth(Math.round(h * aspectRatio))
  }

  const handleProcess = async () => {
    if (!originalFile) return
    setProcessing(true)
    try {
      const options = {
        maxWidthOrHeight: Math.max(width, height),
        initialQuality: quality / 100,
        useWebWorker: true,
        fileType: originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg',
      }

      if (width !== originalImage.naturalWidth || height !== originalImage.naturalHeight) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(originalImage, 0, 0, width, height)
        const blob = await canvasToBlob(canvas, getMimeType(originalFile.type === 'image/png' ? 'png' : 'jpg'), quality / 100)
        setProcessedBlob(blob)
      } else {
        const compressed = await imageCompression(originalFile, options)
        setProcessedBlob(compressed)
      }
    } catch {
      // fallback
    }
    setProcessing(false)
  }

  const ext = originalFile?.type === 'image/png' ? 'png' : 'jpg'

  return (
    <ToolPageLayout title="Redimensionar e Comprimir" description="Altere as dimensões e reduza o tamanho do arquivo">
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
                  src={processedBlob ? URL.createObjectURL(processedBlob) : originalImage.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain rounded"
                />
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>Original: {originalImage.naturalWidth}x{originalImage.naturalHeight} ({formatFileSize(originalFile.size)})</span>
                {processedBlob && (
                  <span className="text-blue-600 font-medium">
                    Resultado: {width}x{height} ({formatFileSize(processedBlob.size)})
                  </span>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Dimensões</h3>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Largura</label>
                  <input
                    type="number"
                    value={width}
                    onChange={e => handleWidthChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <button
                  onClick={() => setLockRatio(!lockRatio)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-slate-500 cursor-pointer mb-0.5"
                  title={lockRatio ? 'Desbloquear proporção' : 'Bloquear proporção'}
                >
                  {lockRatio ? <Lock size={18} /> : <Unlock size={18} />}
                </button>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Altura</label>
                  <input
                    type="number"
                    value={height}
                    onChange={e => handleHeightChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <Slider label="Qualidade" value={quality} onChange={setQuality} min={10} max={100} unit="%" />
            </Card>

            {estimatedSize && !processedBlob && (
              <Card>
                <p className="text-xs text-slate-500">Tamanho estimado: ~{formatFileSize(estimatedSize)}</p>
              </Card>
            )}

            <Button onClick={handleProcess} disabled={processing} className="w-full" size="lg">
              {processing ? <LoadingSpinner size={18} /> : 'Aplicar'}
            </Button>

            <DownloadButton
              blob={processedBlob}
              filename={`redimensionado.${ext}`}
            />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
