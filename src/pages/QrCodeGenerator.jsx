import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Select from '../components/ui/Select'
import QRCode from 'qrcode'

const typeOptions = [
  { value: 'text', label: 'Texto / URL' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
]

const correctionOptions = [
  { value: 'L', label: 'Baixa (7%)' },
  { value: 'M', label: 'Média (15%)' },
  { value: 'Q', label: 'Quartil (25%)' },
  { value: 'H', label: 'Alta (30%)' },
]

export default function QrCodeGenerator() {
  const [type, setType] = useState('text')
  const [text, setText] = useState('')
  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPass, setWifiPass] = useState('')
  const [wifiAuth, setWifiAuth] = useState('WPA')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [size, setSize] = useState(300)
  const [correction, setCorrection] = useState('M')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const canvasRef = useRef(null)
  const [generated, setGenerated] = useState(false)

  const getQrText = () => {
    switch (type) {
      case 'wifi':
        return `WIFI:T:${wifiAuth};S:${wifiSSID};P:${wifiPass};;`
      case 'email':
        return `mailto:${email}`
      case 'phone':
        return `tel:${phone}`
      default:
        return text
    }
  }

  const qrText = getQrText()

  useEffect(() => {
    if (!qrText.trim() || !canvasRef.current) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      setGenerated(false)
      return
    }
    QRCode.toCanvas(canvasRef.current, qrText, {
      width: size,
      margin: 2,
      errorCorrectionLevel: correction,
      color: { dark: fgColor, light: bgColor },
    }).then(() => setGenerated(true)).catch(() => setGenerated(false))
  }, [qrText, size, correction, fgColor, bgColor])

  const handleDownload = () => {
    if (!canvasRef.current || !generated) return
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvasRef.current.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <ToolPageLayout title="Gerador de QR Code" description="Gere QR codes a partir de texto, URLs, Wi-Fi e mais">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <span className="text-sm font-medium text-slate-800 mb-4 block">Preview</span>
            <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center min-h-[350px]">
              <canvas ref={canvasRef} className={generated ? '' : 'hidden'} />
              {!generated && (
                <p className="text-sm text-slate-400">Digite algo para gerar o QR Code</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <Select label="Tipo" value={type} onChange={setType} options={typeOptions} />
          </Card>

          <Card className="space-y-3">
            {type === 'text' && (
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Texto ou URL</label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="https://exemplo.com.br"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>
            )}
            {type === 'wifi' && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Nome da rede (SSID)</label>
                  <input type="text" value={wifiSSID} onChange={e => setWifiSSID(e.target.value)} placeholder="MinhaRede" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Senha</label>
                  <input type="text" value={wifiPass} onChange={e => setWifiPass(e.target.value)} placeholder="senha123" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                </div>
                <Select label="Segurança" value={wifiAuth} onChange={setWifiAuth} options={[
                  { value: 'WPA', label: 'WPA/WPA2' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: 'Aberta' },
                ]} />
              </>
            )}
            {type === 'email' && (
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
              </div>
            )}
            {type === 'phone' && (
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Telefone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+55 11 99999-9999" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
              </div>
            )}
          </Card>

          <Card>
            <Slider label="Tamanho" value={size} onChange={setSize} min={150} max={600} unit="px" />
          </Card>

          <Card>
            <Select label="Correção de Erro" value={correction} onChange={setCorrection} options={correctionOptions} />
          </Card>

          <Card>
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Cor</label>
                <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Fundo</label>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
              </div>
            </div>
          </Card>

          <Button onClick={handleDownload} disabled={!generated} className="w-full" size="lg">
            Baixar QR Code
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  )
}
