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

export default function ImageBorder() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [borderWidth, setBorderWidth] = useState(20)
  const [borderColor, setBorderColor] = useState('#ffffff')
  const [borderRadius, setBorderRadius] = useState(0)
  const [padding, setPadding] = useState(10)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [processing, setProcessing] = useState(false)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const handleApply = async () => {
    if (!originalImage) return
    setProcessing(true)
    try {
      const imgW = originalImage.naturalWidth
      const imgH = originalImage.naturalHeight
      const totalW = imgW + (borderWidth + padding) * 2
      const totalH = imgH + (borderWidth + padding) * 2
      const canvas = document.createElement('canvas')
      canvas.width = totalW
      canvas.height = totalH
      const ctx = canvas.getContext('2d')

      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, totalW, totalH)

      // Border
      ctx.fillStyle = borderColor
      if (borderRadius > 0) {
        const r = borderRadius
        ctx.beginPath()
        ctx.moveTo(r, 0)
        ctx.lineTo(totalW - r, 0)
        ctx.quadraticCurveTo(totalW, 0, totalW, r)
        ctx.lineTo(totalW, totalH - r)
        ctx.quadraticCurveTo(totalW, totalH, totalW - r, totalH)
        ctx.lineTo(r, totalH)
        ctx.quadraticCurveTo(0, totalH, 0, totalH - r)
        ctx.lineTo(0, r)
        ctx.quadraticCurveTo(0, 0, r, 0)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.fillRect(0, 0, totalW, totalH)
      }

      // Image area background
      const imgX = borderWidth + padding
      const imgY = borderWidth + padding
      ctx.fillStyle = bgColor
      ctx.fillRect(imgX - padding, imgY - padding, imgW + padding * 2, imgH + padding * 2)

      // Clip for rounded corners on image
      if (borderRadius > 0) {
        const innerR = Math.max(0, borderRadius - borderWidth)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(imgX + innerR, imgY)
        ctx.lineTo(imgX + imgW - innerR, imgY)
        ctx.quadraticCurveTo(imgX + imgW, imgY, imgX + imgW, imgY + innerR)
        ctx.lineTo(imgX + imgW, imgY + imgH - innerR)
        ctx.quadraticCurveTo(imgX + imgW, imgY + imgH, imgX + imgW - innerR, imgY + imgH)
        ctx.lineTo(imgX + innerR, imgY + imgH)
        ctx.quadraticCurveTo(imgX, imgY + imgH, imgX, imgY + imgH - innerR)
        ctx.lineTo(imgX, imgY + innerR)
        ctx.quadraticCurveTo(imgX, imgY, imgX + innerR, imgY)
        ctx.closePath()
        ctx.clip()
      }

      ctx.drawImage(originalImage, imgX, imgY, imgW, imgH)

      if (borderRadius > 0) ctx.restore()

      const blob = await canvasToBlob(canvas, 'image/png', 0.92)
      setProcessedBlob(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  return (
    <ToolPageLayout title="Moldura / Borda" description="Adicione bordas e cantos arredondados à sua imagem">
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
              <Slider label="Largura da Borda" value={borderWidth} onChange={setBorderWidth} min={0} max={100} unit="px" />
            </Card>

            <Card>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Cor da Borda</label>
                  <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Cor de Fundo</label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
                </div>
              </div>
            </Card>

            <Card>
              <Slider label="Cantos Arredondados" value={borderRadius} onChange={setBorderRadius} min={0} max={100} unit="px" />
            </Card>

            <Card>
              <Slider label="Padding" value={padding} onChange={setPadding} min={0} max={50} unit="px" />
            </Card>

            <Button onClick={handleApply} disabled={processing} className="w-full" size="lg">
              Aplicar
            </Button>

            <DownloadButton blob={processedBlob} filename="moldura.png" />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
