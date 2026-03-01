import { Menu } from 'lucide-react'

export default function Header({ onMenuClick }) {
  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-white border-b border-slate-200 md:hidden">
      <button onClick={onMenuClick} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="font-semibold text-sm">Tools FalaVIP</span>
      </div>
    </header>
  )
}
