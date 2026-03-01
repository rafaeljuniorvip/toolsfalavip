import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, X, Image } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'
import { PDFDocument } from 'pdf-lib'

const pageSizeOptions = [
  { value: 'a4', label: 'A4 (210x297mm)' },
  { value: 'letter', label: 'Carta (216x279mm)' },
  { value: 'original', label: 'Tamanho Original' },
]

const orientationOptions = [
  { value: 'portrait', label: 'Retrato' },
  { value: 'landscape', label: 'Paisagem' },
]

const PAGE_SIZES = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612, h: 792 },
}

export default function ImagesToPdf() {
  const [images, setImages] = useState([])
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('portrait')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const handleFiles = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }))
    setImages(prev => [...prev, ...newImages])
    setResult(null)
  }

  const removeImage = (index) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const moveImage = (from, to) => {
    setImages(prev => {
      const copy = [...prev]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)
      return copy
    })
  }

  const handleConvert = async () => {
    if (images.length === 0) return
    setProcessing(true)
    try {
      const pdfDoc = await PDFDocument.create()

      for (const img of images) {
        const bytes = await img.file.arrayBuffer()
        let embeddedImage
        if (img.file.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(bytes)
        } else {
          embeddedImage = await pdfDoc.embedJpg(bytes)
        }

        let pageW, pageH
        if (pageSize === 'original') {
          pageW = embeddedImage.width
          pageH = embeddedImage.height
        } else {
          const size = PAGE_SIZES[pageSize]
          if (orientation === 'landscape') {
            pageW = size.h
            pageH = size.w
          } else {
            pageW = size.w
            pageH = size.h
          }
        }

        const page = pdfDoc.addPage([pageW, pageH])
        const imgRatio = embeddedImage.width / embeddedImage.height
        const pageRatio = pageW / pageH

        let drawW, drawH, drawX, drawY
        if (pageSize === 'original') {
          drawW = pageW
          drawH = pageH
          drawX = 0
          drawY = 0
        } else {
          const margin = 20
          const availW = pageW - margin * 2
          const availH = pageH - margin * 2
          if (imgRatio > availW / availH) {
            drawW = availW
            drawH = availW / imgRatio
          } else {
            drawH = availH
            drawW = availH * imgRatio
          }
          drawX = (pageW - drawW) / 2
          drawY = (pageH - drawH) / 2
        }

        page.drawImage(embeddedImage, { x: drawX, y: drawY, width: drawW, height: drawH })
      }

      const pdfBytes = await pdfDoc.save()
      setResult(new Blob([pdfBytes], { type: 'application/pdf' }))
    } catch {
      // error
    }
    setProcessing(false)
  }

  const resetAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview))
    setImages([])
    setResult(null)
  }

  return (
    <ToolPageLayout title="Imagens para PDF" description="Combine múltiplas imagens em um único PDF">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-800">Imagens ({images.length})</span>
              {images.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <RotateCcw size={14} /> Limpar
                </Button>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {images.map((img, i) => (
                  <div key={`${img.name}-${i}`} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-gray-50">
                    <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {i > 0 && (
                        <button onClick={() => moveImage(i, i - 1)} className="p-1.5 bg-white rounded-lg text-xs font-bold cursor-pointer">◀</button>
                      )}
                      {i < images.length - 1 && (
                        <button onClick={() => moveImage(i, i + 1)} className="p-1.5 bg-white rounded-lg text-xs font-bold cursor-pointer">▶</button>
                      )}
                      <button onClick={() => removeImage(i)} className="p-1.5 bg-red-500 text-white rounded-lg cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 px-1 truncate">{i + 1}. {img.name}</span>
                  </div>
                ))}
              </div>
            )}

            <DropZone onFiles={handleFiles} accept="image/*" multiple label="Arraste imagens aqui ou clique para adicionar" />

            {result && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700">PDF criado com sucesso!</p>
                <p className="text-xs text-green-600 mt-1">{images.length} imagens - {formatFileSize(result.size)}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <Select label="Tamanho da Página" value={pageSize} onChange={setPageSize} options={pageSizeOptions} />
          </Card>

          {pageSize !== 'original' && (
            <Card>
              <Select label="Orientação" value={orientation} onChange={setOrientation} options={orientationOptions} />
            </Card>
          )}

          <Card>
            <p className="text-sm text-slate-500">
              Adicione imagens e ordene na sequência desejada. Cada imagem será uma página do PDF.
            </p>
          </Card>

          <Button onClick={handleConvert} disabled={processing || images.length === 0} className="w-full" size="lg">
            {processing ? <><LoadingSpinner size={18} /> Gerando PDF...</> : `Gerar PDF (${images.length} imagens)`}
          </Button>

          <DownloadButton blob={result} filename="imagens.pdf" />
        </div>
      </div>
    </ToolPageLayout>
  )
}
