import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Select from '../components/ui/Select'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'
import imageCompression from 'browser-image-compression'

const formatOptions = [
  { value: 'original', label: 'Original' },
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
]

export default function ImageCompress() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [quality, setQuality] = useState(80)
  const [maxSizeMB, setMaxSizeMB] = useState(1)
  const [outputFormat, setOutputFormat] = useState('original')
  const [processing, setProcessing] = useState(false)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const handleCompress = async () => {
    if (!originalFile) return
    setProcessing(true)
    try {
      const fileType = outputFormat === 'original' ? originalFile.type : outputFormat
      const options = {
        maxSizeMB: maxSizeMB,
        initialQuality: quality / 100,
        useWebWorker: true,
        fileType: fileType,
        maxWidthOrHeight: originalImage.naturalWidth,
      }
      const compressed = await imageCompression(originalFile, options)
      setProcessedBlob(compressed)
    } catch {
      // fallback
    }
    setProcessing(false)
  }

  const getExtension = () => {
    if (outputFormat === 'image/png') return 'png'
    if (outputFormat === 'image/webp') return 'webp'
    if (outputFormat === 'image/jpeg') return 'jpg'
    return originalFile?.type === 'image/png' ? 'png' : 'jpg'
  }

  return (
    <ToolPageLayout title="Comprimir Imagem" description="Reduza o tamanho do arquivo com controle de qualidade">
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
                <span>Original: {formatFileSize(originalFile.size)}</span>
                {processedBlob && (
                  <span className="text-blue-600 font-medium">
                    Comprimido: {formatFileSize(processedBlob.size)} ({Math.round((1 - processedBlob.size / originalFile.size) * 100)}% redução)
                  </span>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <Slider label="Qualidade" value={quality} onChange={setQuality} min={10} max={100} unit="%" />
            </Card>

            <Card>
              <label className="text-sm font-medium text-slate-800 mb-1 block">Tamanho máximo (MB)</label>
              <input
                type="number"
                value={maxSizeMB}
                onChange={e => setMaxSizeMB(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                step="0.1"
                min="0.1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </Card>

            <Card>
              <Select label="Formato de saída" value={outputFormat} onChange={setOutputFormat} options={formatOptions} />
            </Card>

            <Button onClick={handleCompress} disabled={processing} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Comprimindo...</> : 'Comprimir'}
            </Button>

            <DownloadButton blob={processedBlob} filename={`comprimido.${getExtension()}`} />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
