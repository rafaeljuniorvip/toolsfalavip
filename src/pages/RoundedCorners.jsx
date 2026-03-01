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

const presets = [
  { label: 'Suave', radius: 16, padding: 0, shadow: false },
  { label: 'macOS', radius: 12, padding: 24, shadow: true },
  { label: 'iOS', radius: 36, padding: 0, shadow: false },
  { label: 'Círculo', radius: 999, padding: 0, shadow: false },
]

export default function RoundedCorners() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [borderRadius, setBorderRadius] = useState(24)
  const [padding, setPadding] = useState(0)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [showShadow, setShowShadow] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const applyPreset = (preset) => {
    setBorderRadius(preset.radius)
    setPadding(preset.padding)
    setShowShadow(preset.shadow)
  }

  const handleApply = async () => {
    if (!originalImage) return
    setProcessing(true)
    try {
      const imgW = originalImage.naturalWidth
      const imgH = originalImage.naturalHeight
      const shadowOffset = showShadow ? 20 : 0
      const shadowBlur = showShadow ? 40 : 0
      const totalW = imgW + padding * 2 + shadowBlur * 2
      const totalH = imgH + padding * 2 + shadowBlur * 2 + shadowOffset
      const canvas = document.createElement('canvas')
      canvas.width = totalW
      canvas.height = totalH
      const ctx = canvas.getContext('2d')

      // Transparent background
      ctx.clearRect(0, 0, totalW, totalH)

      // Background if padding > 0
      if (padding > 0) {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, totalW, totalH)
      }

      const imgX = padding + shadowBlur
      const imgY = padding + shadowBlur
      const r = Math.min(borderRadius, imgW / 2, imgH / 2)

      // Shadow
      if (showShadow) {
        ctx.save()
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = shadowBlur
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = shadowOffset / 2
        ctx.beginPath()
        ctx.roundRect(imgX, imgY, imgW, imgH, r)
        ctx.fillStyle = '#000'
        ctx.fill()
        ctx.restore()
      }

      // Clip and draw image
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(imgX, imgY, imgW, imgH, r)
      ctx.clip()
      ctx.drawImage(originalImage, imgX, imgY, imgW, imgH)
      ctx.restore()

      const blob = await canvasToBlob(canvas, 'image/png', 1)
      setProcessedBlob(blob)
    } catch {}
    setProcessing(false)
  }

  return (
    <ToolPageLayout title="Cantos Arredondados" description="Adicione cantos arredondados e sombra à imagem">
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
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[300px]" style={{ backgroundImage: 'repeating-conic-gradient(#d1d5db 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }}>
                <img
                  src={processedBlob ? URL.createObjectURL(processedBlob) : originalImage.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain"
                />
              </div>
              {processedBlob && (
                <p className="mt-3 text-xs text-slate-500">Tamanho: {formatFileSize(processedBlob.size)}</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <Slider label="Border Radius" value={borderRadius} onChange={setBorderRadius} min={0} max={200} unit="px" />
            </Card>

            <Card>
              <Slider label="Padding" value={padding} onChange={setPadding} min={0} max={100} unit="px" />
              {padding > 0 && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Cor de Fundo</label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
                </div>
              )}
            </Card>

            <Card>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showShadow} onChange={e => setShowShadow(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-800">Sombra</span>
              </label>
            </Card>

            <Button onClick={handleApply} disabled={processing} className="w-full" size="lg">
              Aplicar
            </Button>

            <DownloadButton blob={processedBlob} filename="cantos-arredondados.png" />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
