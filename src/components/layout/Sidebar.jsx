import { NavLink, useLocation } from 'react-router-dom'
import { X, Maximize2, Crop, FileType, RotateCw, Sun, Palette, Stamp, FileDown, FilePlus2, Scissors, RotateCcw, Home } from 'lucide-react'

const imageTools = [
  { path: '/redimensionar', label: 'Redimensionar', icon: Maximize2 },
  { path: '/recortar', label: 'Recortar', icon: Crop },
  { path: '/converter', label: 'Converter Formato', icon: FileType },
  { path: '/girar', label: 'Girar / Espelhar', icon: RotateCw },
  { path: '/ajustar', label: 'Brilho / Contraste', icon: Sun },
  { path: '/filtros', label: 'Filtros', icon: Palette },
  { path: '/marca-dagua', label: 'Marca d\'Água', icon: Stamp },
]

const pdfTools = [
  { path: '/pdf-comprimir', label: 'Comprimir PDF', icon: FileDown },
  { path: '/pdf-juntar', label: 'Juntar PDFs', icon: FilePlus2 },
  { path: '/pdf-dividir', label: 'Dividir PDF', icon: Scissors },
  { path: '/pdf-girar', label: 'Girar PDF', icon: RotateCcw },
]

function NavItem({ path, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/25'
          : 'text-slate-400 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 sidebar-glow
        flex flex-col transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30 flex items-center justify-center">
              <span className="text-white font-bold text-base">T</span>
            </div>
            <span className="font-bold text-base text-white">Tools FalaVIP</span>
          </NavLink>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 md:hidden cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 sidebar-scroll">
          <div>
            <NavLink
              to="/"
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Home size={18} />
              <span>Inicio</span>
            </NavLink>
          </div>

          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Imagem</p>
            <div className="space-y-0.5">
              {imageTools.map(tool => (
                <NavItem key={tool.path} {...tool} onClick={onClose} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">PDF</p>
            <div className="space-y-0.5">
              {pdfTools.map(tool => (
                <NavItem key={tool.path} {...tool} onClick={onClose} />
              ))}
            </div>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
            <p className="text-[11px] text-slate-500">
              Processamento 100% local
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
