import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Select from '../components/ui/Select'
import DownloadButton from '../components/shared/DownloadButton'
import { RotateCcw } from 'lucide-react'
import { formatFileSize, canvasToBlob } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

const positions = [
  { value: 'top-left', label: 'Sup. Esquerda' },
  { value: 'top-center', label: 'Sup. Centro' },
  { value: 'top-right', label: 'Sup. Direita' },
  { value: 'center', label: 'Centro' },
  { value: 'bottom-left', label: 'Inf. Esquerda' },
  { value: 'bottom-center', label: 'Inf. Centro' },
  { value: 'bottom-right', label: 'Inf. Direita' },
]

const fonts = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Courier New, monospace', label: 'Courier' },
  { value: 'Impact, sans-serif', label: 'Impact' },
]

function getTextPosition(pos, canvasW, canvasH, textW, textH, padding) {
  const p = padding
  switch (pos) {
    case 'top-left': return { x: p, y: p + textH }
    case 'top-center': return { x: (canvasW - textW) / 2, y: p + textH }
    case 'top-right': return { x: canvasW - textW - p, y: p + textH }
    case 'center': return { x: (canvasW - textW) / 2, y: (canvasH + textH) / 2 }
    case 'bottom-left': return { x: p, y: canvasH - p }
    case 'bottom-center': return { x: (canvasW - textW) / 2, y: canvasH - p }
    case 'bottom-right': return { x: canvasW - textW - p, y: canvasH - p }
    default: return { x: p, y: canvasH - p }
  }
}

export default function Watermark() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [text, setText] = useState('FalaVIP')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(50)
  const [color, setColor] = useState('#ffffff')
  const [position, setPosition] = useState('bottom-right')
  const [font, setFont] = useState('Inter, sans-serif')
  const [tile, setTile] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const handleApply = async () => {
    if (!originalImage || !text.trim()) return
    setProcessing(true)
    try {
      const canvas = document.createElement('canvas')
      const w = originalImage.naturalWidth
      const h = originalImage.naturalHeight
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(originalImage, 0, 0)

      ctx.globalAlpha = opacity / 100
      ctx.fillStyle = color
      ctx.font = `${fontSize}px ${font}`
      ctx.textBaseline = 'bottom'

      if (tile) {
        const metrics = ctx.measureText(text)
        const tw = metrics.width + 60
        const th = fontSize + 60
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.rotate(-Math.PI / 6)
        for (let y = -h; y < h * 2; y += th) {
          for (let x = -w; x < w * 2; x += tw) {
            ctx.fillText(text, x, y)
          }
        }
        ctx.restore()
      } else {
        const metrics = ctx.measureText(text)
        const padding = Math.max(20, fontSize * 0.5)
        const pos = getTextPosition(position, w, h, metrics.width, fontSize, padding)
        ctx.fillText(text, pos.x, pos.y)
      }

      const blob = await canvasToBlob(canvas, originalFile?.type || 'image/png', 0.92)
      setProcessedBlob(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  return (
    <ToolPageLayout title="Marca d'Água" description="Adicione texto sobre a imagem como marca d'água">
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
                <img src={originalImage.src} alt="Preview" className="max-w-full max-h-[500px] object-contain rounded" />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Texto</label>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Sua marca d'água"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Select label="Fonte" value={font} onChange={setFont} options={fonts} />
              <Slider label="Tamanho" value={fontSize} onChange={setFontSize} min={12} max={200} unit="px" />
              <Slider label="Opacidade" value={opacity} onChange={setOpacity} min={5} max={100} unit="%" />
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Cor</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
              </div>
            </Card>

            <Card>
              <Select label="Posição" value={position} onChange={setPosition} options={positions} />
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={tile} onChange={e => setTile(e.target.checked)} className="rounded" />
                <span className="text-sm text-text">Repetir em toda a imagem</span>
              </label>
            </Card>

            <Button onClick={handleApply} disabled={processing || !text.trim()} className="w-full" size="lg">
              Aplicar
            </Button>

            {processedBlob && (
              <Card>
                <p className="text-xs text-text-secondary">Tamanho: {formatFileSize(processedBlob.size)}</p>
              </Card>
            )}

            <DownloadButton blob={processedBlob} filename="marca-dagua.png" />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
