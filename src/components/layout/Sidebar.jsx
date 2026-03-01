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
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-gray-100 hover:text-text'
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
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border
        flex flex-col transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <NavLink to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-base">T</span>
            </div>
            <span className="font-bold text-base text-text">Tools FalaVIP</span>
          </NavLink>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 md:hidden cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <NavLink
              to="/"
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text'
                }`
              }
            >
              <Home size={18} />
              <span>Início</span>
            </NavLink>
          </div>

          <div>
            <p className="px-3 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Imagem</p>
            <div className="space-y-0.5">
              {imageTools.map(tool => (
                <NavItem key={tool.path} {...tool} onClick={onClose} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">PDF</p>
            <div className="space-y-0.5">
              {pdfTools.map(tool => (
                <NavItem key={tool.path} {...tool} onClick={onClose} />
              ))}
            </div>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-text-secondary text-center">
            Processamento 100% local
          </p>
        </div>
      </aside>
    </>
  )
}
