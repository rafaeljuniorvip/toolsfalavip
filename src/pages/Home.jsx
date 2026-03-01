import { Link } from 'react-router-dom'
import { Maximize2, Crop, FileType, RotateCw, Sun, Palette, Stamp, FileDown, FilePlus2, Scissors, RotateCcw } from 'lucide-react'

const imageTools = [
  { path: '/redimensionar', label: 'Redimensionar', desc: 'Altere o tamanho e comprima imagens', icon: Maximize2, color: 'bg-blue-50 text-blue-600' },
  { path: '/recortar', label: 'Recortar', desc: 'Corte partes da imagem com precisão', icon: Crop, color: 'bg-green-50 text-green-600' },
  { path: '/converter', label: 'Converter Formato', desc: 'Converta entre PNG, JPG e WebP', icon: FileType, color: 'bg-purple-50 text-purple-600' },
  { path: '/girar', label: 'Girar / Espelhar', desc: 'Rotacione ou espelhe a imagem', icon: RotateCw, color: 'bg-orange-50 text-orange-600' },
  { path: '/ajustar', label: 'Brilho / Contraste', desc: 'Ajuste brilho, contraste e saturação', icon: Sun, color: 'bg-yellow-50 text-yellow-700' },
  { path: '/filtros', label: 'Filtros', desc: 'Aplique filtros como sépia e P&B', icon: Palette, color: 'bg-pink-50 text-pink-600' },
  { path: '/marca-dagua', label: 'Marca d\'Água', desc: 'Adicione texto como marca d\'água', icon: Stamp, color: 'bg-indigo-50 text-indigo-600' },
]

const pdfTools = [
  { path: '/pdf-comprimir', label: 'Comprimir PDF', desc: 'Reduza o tamanho de arquivos PDF', icon: FileDown, color: 'bg-red-50 text-red-600' },
  { path: '/pdf-juntar', label: 'Juntar PDFs', desc: 'Combine múltiplos PDFs em um só', icon: FilePlus2, color: 'bg-teal-50 text-teal-600' },
  { path: '/pdf-dividir', label: 'Dividir PDF', desc: 'Separe páginas de um PDF', icon: Scissors, color: 'bg-cyan-50 text-cyan-600' },
  { path: '/pdf-girar', label: 'Girar PDF', desc: 'Rotacione páginas do PDF', icon: RotateCcw, color: 'bg-amber-50 text-amber-600' },
]

function ToolCard({ path, label, desc, icon: Icon, color }) {
  return (
    <Link
      to={path}
      className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-600/30 hover:shadow-md transition-all"
    >
      <div className={`w-11 h-11 rounded-lg ${color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-slate-800 text-sm mb-1">{label}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </Link>
  )
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Tools FalaVIP</h1>
        <p className="text-slate-500">
          Ferramentas gratuitas de imagem e PDF. Processamento 100% local, sem upload para servidores.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">Ferramentas de Imagem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {imageTools.map(tool => <ToolCard key={tool.path} {...tool} />)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">Ferramentas de PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pdfTools.map(tool => <ToolCard key={tool.path} {...tool} />)}
        </div>
      </section>
    </div>
  )
}
