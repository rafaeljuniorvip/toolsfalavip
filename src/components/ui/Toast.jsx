import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export default function Toast({ message, type = 'info', onClose }) {
  const Icon = icons[type] || Info

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg min-w-[280px] animate-slide-in ${colors[type]}`}>
      <Icon size={18} />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 cursor-pointer">
        <X size={16} />
      </button>
    </div>
  )
}
