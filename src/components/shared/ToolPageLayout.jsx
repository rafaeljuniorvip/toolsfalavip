import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ToolPageLayout({ title, description, children }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}
