import { useState, useRef } from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DownloadButton from '../components/shared/DownloadButton'
import { RotateCcw } from 'lucide-react'
import { formatFileSize, canvasToBlob } from '../utils/fileHelpers'
import useImageProcessor from '../hooks/useImageProcessor'

const aspectRatios = [
  { label: 'Livre', value: NaN },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
]

export default function Crop() {
  const { originalFile, originalImage, processedBlob, loadImage, setProcessedBlob, reset } = useImageProcessor()
  const [activeRatio, setActiveRatio] = useState(NaN)
  const [processing, setProcessing] = useState(false)
  const cropperRef = useRef(null)

  const handleFiles = async ([file]) => {
    if (file) await loadImage(file)
  }

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return
    setProcessing(true)
    try {
      const canvas = cropper.getCroppedCanvas()
      const blob = await canvasToBlob(canvas, originalFile?.type || 'image/png', 0.92)
      setProcessedBlob(blob)
    } catch {
      // error
    }
    setProcessing(false)
  }

  const handleRatio = (value) => {
    setActiveRatio(value)
    const cropper = cropperRef.current?.cropper
    if (cropper) cropper.setAspectRatio(value)
  }

  return (
    <ToolPageLayout title="Recortar Imagem" description="Selecione a área que deseja manter">
      {!originalImage ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text">Selecione a área de corte</span>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw size={14} /> Nova imagem
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <Cropper
                  ref={cropperRef}
                  src={originalImage.src}
                  style={{ height: 500, width: '100%' }}
                  aspectRatio={activeRatio}
                  viewMode={1}
                  guides
                  responsive
                  autoCropArea={0.8}
                  background={false}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-text mb-3">Proporção</h3>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => handleRatio(r.value)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer
                      ${(isNaN(activeRatio) && isNaN(r.value)) || activeRatio === r.value
                        ? 'bg-primary text-white border-primary'
                        : 'border-border hover:bg-gray-50'
                      }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Card>

            <Button onClick={handleCrop} disabled={processing} className="w-full" size="lg">
              Recortar
            </Button>

            {processedBlob && (
              <>
                <Card>
                  <p className="text-xs text-text-secondary">
                    Tamanho: {formatFileSize(processedBlob.size)}
                  </p>
                </Card>
                <DownloadButton blob={processedBlob} filename="recortado.png" />
              </>
            )}
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
