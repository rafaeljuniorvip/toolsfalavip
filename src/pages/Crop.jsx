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
  { label: '9:16', value: 9 / 16 },
  { label: '2.63:1', value: 2.63 },
  { label: '3:1', value: 3 },
  { label: '4:1', value: 4 },
]

const presetGroups = [
  { label: 'Instagram Post', value: 1 },
  { label: 'Instagram Story', value: 9 / 16 },
  { label: 'Facebook Cover', value: 2.63 },
  { label: 'Twitter Header', value: 3 },
  { label: 'YouTube Thumb', value: 16 / 9 },
  { label: 'LinkedIn Banner', value: 4 },
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
                <span className="text-sm font-medium text-slate-800">Selecione a área de corte</span>
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
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Proporção</h3>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => handleRatio(r.value)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer
                      ${(isNaN(activeRatio) && isNaN(r.value)) || activeRatio === r.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-gray-50'
                      }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Redes Sociais</h3>
              <div className="grid grid-cols-2 gap-2">
                {presetGroups.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleRatio(p.value)}
                    className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer
                      ${activeRatio === p.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-gray-50'
                      }`}
                  >
                    {p.label}
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
                  <p className="text-xs text-slate-500">
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
