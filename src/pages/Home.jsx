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

function ToolCard({ path, label, desc, icon: Icon, color, index }) {
  return (
    <Link
      to={path}
      className={`group bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm
        hover:shadow-lg hover:border-blue-300/50 hover:-translate-y-1 transition-all duration-200
        animate-fade-in-up stagger-${index + 1}`}
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3.5
        group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <h3 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-blue-700 transition-colors">{label}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </Link>
  )
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="bg-hero-gradient rounded-2xl p-8 md:p-10 mb-10 text-center shadow-xl shadow-slate-900/10 animate-fade-in-up">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Tools FalaVIP</h1>
        <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Ferramentas gratuitas de imagem e PDF. Processamento 100% local, sem upload para servidores.
        </p>
        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
          <span className="text-sm text-slate-400">Privacidade total garantida</span>
        </div>
      </div>

      {/* Image Tools Section */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5 px-1">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Ferramentas de Imagem</h2>
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-medium">{imageTools.length} tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {imageTools.map((tool, i) => <ToolCard key={tool.path} {...tool} index={i} />)}
        </div>
      </section>

      {/* PDF Tools Section */}
      <section className="mb-6">
        <div className="flex items-center gap-3 mb-5 px-1">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Ferramentas de PDF</h2>
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-medium">{pdfTools.length} tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pdfTools.map((tool, i) => <ToolCard key={tool.path} {...tool} index={i + imageTools.length} />)}
        </div>
      </section>
    </div>
  )
}
