import { Menu } from 'lucide-react'

export default function Header({ onMenuClick }) {
  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm md:hidden">
      <button onClick={onMenuClick} className="p-1.5 rounded-lg hover:bg-gray-100 active:scale-95 cursor-pointer transition-all">
        <Menu size={22} className="text-slate-700" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-blue-600 shadow-md shadow-blue-600/25 flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="font-semibold text-sm text-slate-800">Tools FalaVIP</span>
      </div>
    </header>
  )
}
