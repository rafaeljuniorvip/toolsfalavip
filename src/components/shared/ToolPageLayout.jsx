import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ToolPageLayout({ title, description, children }) {
  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-all duration-200 mb-4 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar</span>
        </Link>
        <div className="bg-header-accent rounded-xl p-6 border border-slate-200/60">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-1.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}
