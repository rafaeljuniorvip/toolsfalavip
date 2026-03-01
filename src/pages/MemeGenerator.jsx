import { useState, useRef, useEffect } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import DownloadButton from '../components/shared/DownloadButton'
import { RotateCcw } from 'lucide-react'
import { formatFileSize, canvasToBlob } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

export default function MemeGenerator() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [processing, setProcessing] = useState(false)
  const previewRef = useRef(null)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  useEffect(() => {
    if (!originalImage || !previewRef.current) return
    const canvas = previewRef.current
    const w = originalImage.naturalWidth
    const h = originalImage.naturalHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(originalImage, 0, 0)

    ctx.fillStyle = textColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = fontSize / 10
    ctx.lineJoin = 'round'
    ctx.font = `bold ${fontSize}px Impact, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    if (topText) {
      const x = w / 2
      const y = fontSize * 0.3
      ctx.strokeText(topText.toUpperCase(), x, y)
      ctx.fillText(topText.toUpperCase(), x, y)
    }

    if (bottomText) {
      ctx.textBaseline = 'bottom'
      const x = w / 2
      const y = h - fontSize * 0.3
      ctx.strokeText(bottomText.toUpperCase(), x, y)
      ctx.fillText(bottomText.toUpperCase(), x, y)
    }
  }, [originalImage, topText, bottomText, fontSize, textColor, strokeColor])

  const handleGenerate = async () => {
    if (!originalImage || !previewRef.current) return
    setProcessing(true)
    try {
      const blob = await canvasToBlob(previewRef.current, 'image/png', 0.92)
      setProcessedBlob(blob)
    } catch {}
    setProcessing(false)
  }

  return (
    <ToolPageLayout title="Gerador de Memes" description="Adicione texto no estilo meme clássico">
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
                <canvas ref={previewRef} className="max-w-full max-h-[500px] object-contain rounded" />
              </div>
              {processedBlob && (
                <p className="mt-3 text-xs text-slate-500">Tamanho: {formatFileSize(processedBlob.size)}</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Texto Superior</label>
                <input type="text" value={topText} onChange={e => setTopText(e.target.value)} placeholder="TEXTO DE CIMA" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Texto Inferior</label>
                <input type="text" value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder="TEXTO DE BAIXO" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
              </div>
            </Card>

            <Card>
              <Slider label="Tamanho da Fonte" value={fontSize} onChange={setFontSize} min={16} max={120} unit="px" />
            </Card>

            <Card>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Texto</label>
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Contorno</label>
                  <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
                </div>
              </div>
            </Card>

            <Button onClick={handleGenerate} disabled={processing} className="w-full" size="lg">
              Gerar Meme
            </Button>

            <DownloadButton blob={processedBlob} filename="meme.png" />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
