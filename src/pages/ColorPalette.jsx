import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import { Copy, Check } from 'lucide-react'

const modeOptions = [
  { value: 'complementary', label: 'Complementar' },
  { value: 'analogous', label: 'Análogo' },
  { value: 'triadic', label: 'Triádico' },
  { value: 'split', label: 'Split-Complementar' },
  { value: 'tetradic', label: 'Tetrádico' },
  { value: 'monochromatic', label: 'Monocromático' },
]

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generatePalette(hex, mode) {
  const [h, s, l] = hexToHsl(hex)
  const colors = [{ hex, h, s, l }]

  switch (mode) {
    case 'complementary':
      colors.push({ hex: hslToHex(h + 180, s, l), h: h + 180, s, l })
      break
    case 'analogous':
      colors.push({ hex: hslToHex(h - 30, s, l), h: h - 30, s, l })
      colors.push({ hex: hslToHex(h + 30, s, l), h: h + 30, s, l })
      colors.push({ hex: hslToHex(h - 60, s, l), h: h - 60, s, l })
      colors.push({ hex: hslToHex(h + 60, s, l), h: h + 60, s, l })
      break
    case 'triadic':
      colors.push({ hex: hslToHex(h + 120, s, l), h: h + 120, s, l })
      colors.push({ hex: hslToHex(h + 240, s, l), h: h + 240, s, l })
      break
    case 'split':
      colors.push({ hex: hslToHex(h + 150, s, l), h: h + 150, s, l })
      colors.push({ hex: hslToHex(h + 210, s, l), h: h + 210, s, l })
      break
    case 'tetradic':
      colors.push({ hex: hslToHex(h + 90, s, l), h: h + 90, s, l })
      colors.push({ hex: hslToHex(h + 180, s, l), h: h + 180, s, l })
      colors.push({ hex: hslToHex(h + 270, s, l), h: h + 270, s, l })
      break
    case 'monochromatic':
      for (let i = 1; i <= 4; i++) {
        const newL = Math.max(10, Math.min(90, l + (i - 2) * 15))
        colors.push({ hex: hslToHex(h, s, newL), h, s, l: newL })
      }
      break
  }
  return colors.map(c => ({ ...c, hex: c.hex, hsl: `hsl(${((c.h % 360) + 360) % 360}, ${c.s}%, ${c.l}%)` }))
}

export default function ColorPalette() {
  const [baseColor, setBaseColor] = useState('#3b82f6')
  const [mode, setMode] = useState('analogous')
  const [copied, setCopied] = useState('')

  const palette = generatePalette(baseColor, mode)

  const copyColor = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  const copyCss = () => {
    const css = palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')
    copyColor(`:root {\n${css}\n}`)
  }

  const copyTailwind = () => {
    const tw = palette.map((c, i) => `  '${i + 1}': '${c.hex}',`).join('\n')
    copyColor(`colors: {\n${tw}\n}`)
  }

  return (
    <ToolPageLayout title="Gerador de Paleta de Cores" description="Crie paletas harmoniosas a partir de uma cor base">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <span className="text-sm font-medium text-slate-800 mb-4 block">Paleta Gerada</span>
            <div className="flex rounded-xl overflow-hidden h-40 mb-4">
              {palette.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 cursor-pointer hover:flex-[1.5] transition-all duration-200 relative group"
                  style={{ backgroundColor: c.hex }}
                  onClick={() => copyColor(c.hex)}
                >
                  <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">{c.hex}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {palette.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 shrink-0" style={{ backgroundColor: c.hex }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono font-medium text-slate-800">{c.hex}</span>
                      <button onClick={() => copyColor(c.hex)} className="cursor-pointer">
                        {copied === c.hex ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-slate-400" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{c.hsl}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <label className="text-sm font-medium text-slate-800 mb-2 block">Cor Base</label>
            <div className="flex items-center gap-3">
              <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-12 h-10 rounded cursor-pointer" />
              <input type="text" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
            </div>
          </Card>

          <Card>
            <Select label="Modo de Harmonia" value={mode} onChange={setMode} options={modeOptions} />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Exportar</h3>
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full" onClick={copyCss}>
                {copied.includes(':root') ? <><Check size={14} className="text-green-600" /> Copiado!</> : <><Copy size={14} /> Copiar CSS</>}
              </Button>
              <Button variant="secondary" size="sm" className="w-full" onClick={copyTailwind}>
                {copied.includes('colors') ? <><Check size={14} className="text-green-600" /> Copiado!</> : <><Copy size={14} /> Copiar Tailwind</>}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ToolPageLayout>
  )
}
