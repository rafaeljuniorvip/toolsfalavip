import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { RotateCcw, Copy, Check } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

export default function ImageToBase64() {
  const { originalFile, originalImage, loadImage, reset } = useImageProcessor()
  const [base64, setBase64] = useState('')
  const [copied, setCopied] = useState('')

  const handleFiles = async ([file]) => {
    if (!file) return
    await loadImage(file)
    const reader = new FileReader()
    reader.onload = () => setBase64(reader.result)
    reader.readAsDataURL(file)
  }

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const dataUrl = base64
  const imgTag = `<img src="${base64}" alt="image" />`
  const cssBg = `background-image: url('${base64}');`

  const handleReset = () => {
    reset()
    setBase64('')
    setCopied('')
  }

  return (
    <ToolPageLayout title="Imagem para Base64" description="Converta imagens para texto Base64 para usar em HTML/CSS">
      {!originalImage ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-800">Imagem Original</span>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw size={14} /> Nova imagem
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                <img src={originalImage.src} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded" />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {originalFile.name} - {formatFileSize(originalFile.size)} - Base64: {formatFileSize(base64.length)}
              </p>
            </Card>

            <Card className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-800">Data URL</span>
                <Button variant="ghost" size="sm" onClick={() => copyText(dataUrl, 'dataurl')}>
                  {copied === 'dataurl' ? <><Check size={14} className="text-green-600" /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                </Button>
              </div>
              <textarea
                readOnly
                value={dataUrl}
                className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none resize-none bg-gray-50"
              />
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Copiar como</h3>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => copyText(dataUrl, 'dataurl')}>
                  {copied === 'dataurl' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  Data URL
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => copyText(imgTag, 'img')}>
                  {copied === 'img' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  Tag &lt;img&gt;
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => copyText(cssBg, 'css')}>
                  {copied === 'css' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  CSS background-image
                </Button>
              </div>
            </Card>

            <Card>
              <p className="text-sm text-slate-500">
                Base64 converte a imagem em texto, permitindo incorporar diretamente no HTML ou CSS sem precisar de um arquivo separado.
              </p>
            </Card>
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
