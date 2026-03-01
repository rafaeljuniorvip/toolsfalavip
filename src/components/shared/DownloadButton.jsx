import { Download } from 'lucide-react'
import Button from '../ui/Button'

export default function DownloadButton({ blob, filename, disabled }) {
  const handleDownload = () => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleDownload} disabled={disabled || !blob} size="lg" className="w-full">
      <Download size={18} />
      Baixar
    </Button>
  )
}
