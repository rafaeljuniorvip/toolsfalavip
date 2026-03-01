import { useState, useRef } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { RotateCcw, Copy, Check } from 'lucide-react'
import useImageProcessor from '../hooks/useImageProcessor'

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function extractColors(imageData, count = 8) {
  const data = imageData.data
  const colorMap = {}
  const step = Math.max(1, Math.floor(data.length / 4 / 10000))

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = Math.round(data[i] / 16) * 16
    const g = Math.round(data[i + 1] / 16) * 16
    const b = Math.round(data[i + 2] / 16) * 16
    const key = `${r},${g},${b}`
    colorMap[key] = (colorMap[key] || 0) + 1
  }

  return Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number)
      return { r, g, b, hex: rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b) }
    })
}

export default function ColorExtractor() {
  const { originalImage, loadImage, reset } = useImageProcessor()
  const [colors, setColors] = useState([])
  const [pickedColor, setPickedColor] = useState(null)
  const [copied, setCopied] = useState('')
  const canvasRef = useRef(null)

  const handleFiles = async ([file]) => {
    if (!file) return
    const img = await loadImage(file)
    if (!img) return
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    canvasRef.current = canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setColors(extractColors(imageData))
  }

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !originalImage) return
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = originalImage.naturalWidth / rect.width
    const scaleY = originalImage.naturalHeight / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    const ctx = canvasRef.current.getContext('2d')
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    setPickedColor({ r, g, b, hex: rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b) })
  }

  const copyColor = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleReset = () => { reset(); setColors([]); setPickedColor(null) }

  const ColorSwatch = ({ color }) => (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 cursor-pointer" style={{ backgroundColor: color.hex }} onClick={() => copyColor(color.hex)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono font-medium text-slate-800">{color.hex}</span>
          <button onClick={() => copyColor(color.hex)} className="cursor-pointer">
            {copied === color.hex ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-slate-400" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 truncate">{color.rgb}</p>
        <p className="text-[10px] text-slate-500 truncate">{color.hsl}</p>
      </div>
    </div>
  )

  return (
    <ToolPageLayout title="Extrator de Cores" description="Extraia cores dominantes e use o color picker na imagem">
      {!originalImage ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-800">Clique na imagem para capturar uma cor</span>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw size={14} /> Nova imagem
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                <img
                  src={originalImage.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain rounded cursor-crosshair"
                  onClick={handleCanvasClick}
                />
              </div>
              {pickedColor && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 rounded-lg border border-slate-200" style={{ backgroundColor: pickedColor.hex }} />
                  <div className="flex-1">
                    <p className="text-sm font-mono font-medium">{pickedColor.hex}</p>
                    <p className="text-xs text-slate-500">{pickedColor.rgb} | {pickedColor.hsl}</p>
                  </div>
                  <button onClick={() => copyColor(pickedColor.hex)} className="cursor-pointer p-1.5 hover:bg-blue-100 rounded">
                    {copied === pickedColor.hex ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-500" />}
                  </button>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Cores Dominantes</h3>
              <div className="space-y-2">
                {colors.map((c, i) => <ColorSwatch key={i} color={c} />)}
              </div>
            </Card>
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
