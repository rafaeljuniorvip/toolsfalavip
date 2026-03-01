import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { RotateCcw, Download } from 'lucide-react'

export default function Base64ToImage() {
  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [error, setError] = useState(null)

  const handleConvert = () => {
    setError(null)
    let src = input.trim()
    if (!src) return

    // If it's a raw base64 string without data: prefix, try to detect format
    if (!src.startsWith('data:')) {
      // Try to detect if it's valid base64
      try {
        atob(src.substring(0, 100))
        src = `data:image/png;base64,${src}`
      } catch {
        setError('String Base64 inválida')
        return
      }
    }

    // Validate by loading as image
    const img = new Image()
    img.onload = () => setImageUrl(src)
    img.onerror = () => {
      setError('Não foi possível decodificar a imagem. Verifique se o Base64 é válido.')
      setImageUrl(null)
    }
    img.src = src
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.download = 'imagem-decodificada.png'
    link.href = imageUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    setInput('')
    setImageUrl(null)
    setError(null)
  }

  return (
    <ToolPageLayout title="Base64 para Imagem" description="Cole uma string Base64 para converter em imagem">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-800">Entrada Base64</span>
              {input && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw size={14} /> Limpar
                </Button>
              )}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Cole aqui o texto Base64 ou Data URL (data:image/png;base64,...)..."
              rows={6}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
            />

            {error && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {imageUrl && (
              <div className="mt-4">
                <span className="text-sm font-medium text-slate-800 mb-2 block">Imagem Decodificada</span>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[200px]" style={{ backgroundImage: 'repeating-conic-gradient(#d1d5db 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }}>
                  <img src={imageUrl} alt="Decoded" className="max-w-full max-h-[400px] object-contain rounded" />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-sm text-slate-500">
              Cole uma string Base64 ou Data URL completa. A ferramenta detecta automaticamente o formato da imagem.
            </p>
          </Card>

          <Button onClick={handleConvert} disabled={!input.trim()} className="w-full" size="lg">
            Converter
          </Button>

          {imageUrl && (
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download size={18} /> Baixar Imagem
            </Button>
          )}
        </div>
      </div>
    </ToolPageLayout>
  )
}
