export default function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-800">{label}</label>
        <span className="text-sm text-slate-500 font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  )
}
