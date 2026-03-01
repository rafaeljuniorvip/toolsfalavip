import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'

const units = [
  { value: 'px', label: 'Pixels (px)' },
  { value: 'cm', label: 'Centímetros (cm)' },
  { value: 'mm', label: 'Milímetros (mm)' },
  { value: 'in', label: 'Polegadas (in)' },
  { value: 'pt', label: 'Pontos (pt)' },
  { value: 'em', label: 'Em' },
  { value: 'rem', label: 'Rem' },
]

const BASE_PX = {
  px: 1,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  in: 96,
  pt: 96 / 72,
  em: 16,
  rem: 16,
}

export default function UnitConverter() {
  const [value, setValue] = useState('100')
  const [fromUnit, setFromUnit] = useState('px')
  const [dpi, setDpi] = useState(96)
  const [baseFontSize, setBaseFontSize] = useState(16)

  const getBasePx = (unit) => {
    if (unit === 'cm') return dpi / 2.54
    if (unit === 'mm') return dpi / 25.4
    if (unit === 'in') return dpi
    if (unit === 'pt') return dpi / 72
    if (unit === 'em' || unit === 'rem') return baseFontSize
    return 1
  }

  const numValue = parseFloat(value) || 0
  const valuePx = numValue * getBasePx(fromUnit)

  const conversions = units.map(u => ({
    ...u,
    result: u.value === fromUnit ? numValue : (valuePx / getBasePx(u.value)),
  }))

  return (
    <ToolPageLayout title="Conversor de Unidades" description="Converta entre px, cm, mm, in, pt, em e rem">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Resultados da Conversão</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conversions.map(c => (
                <div key={c.value} className={`p-4 rounded-lg border ${c.value === fromUnit ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-500 mb-1">{c.label}</p>
                  <p className={`text-lg font-mono font-bold ${c.value === fromUnit ? 'text-blue-700' : 'text-slate-800'}`}>
                    {c.result % 1 === 0 ? c.result : c.result.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <label className="text-sm font-medium text-slate-800 mb-1 block">Valor</label>
            <input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </Card>

          <Card>
            <Select label="Unidade de origem" value={fromUnit} onChange={setFromUnit} options={units} />
          </Card>

          <Card>
            <label className="text-sm font-medium text-slate-800 mb-1 block">DPI (para cm, mm, in, pt)</label>
            <input
              type="number"
              value={dpi}
              onChange={e => setDpi(Math.max(1, parseInt(e.target.value) || 96))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </Card>

          <Card>
            <label className="text-sm font-medium text-slate-800 mb-1 block">Font size base (para em/rem)</label>
            <input
              type="number"
              value={baseFontSize}
              onChange={e => setBaseFontSize(Math.max(1, parseInt(e.target.value) || 16))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <p className="text-xs text-slate-500 mt-1">Padrão dos navegadores: 16px</p>
          </Card>
        </div>
      </div>
    </ToolPageLayout>
  )
}
