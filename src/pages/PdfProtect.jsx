import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import DropZone from '../components/ui/DropZone'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DownloadButton from '../components/shared/DownloadButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RotateCcw, FileText, Eye, EyeOff } from 'lucide-react'
import { formatFileSize } from '../utils/fileHelpers'

export default function PdfProtect() {
  const [file, setFile] = useState(null)
  const [userPassword, setUserPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [permissions, setPermissions] = useState({ print: true, copy: false, edit: false })
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFiles = ([f]) => {
    if (f) { setFile(f); setResult(null); setError(null) }
  }

  const handleProtect = async () => {
    if (!file || !userPassword) return
    setProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('userPassword', userPassword)
      formData.append('ownerPassword', ownerPassword || userPassword)
      formData.append('permissions', JSON.stringify(permissions))

      const res = await fetch('/api/pdf/protect', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao proteger')
      }
      const blob = await res.blob()
      setResult(blob)
    } catch (err) {
      setError(err.message)
    }
    setProcessing(false)
  }

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetAll = () => { setFile(null); setResult(null); setError(null) }

  return (
    <ToolPageLayout title="Proteger PDF com Senha" description="Adicione proteção por senha ao seu PDF">
      {!file ? (
        <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" label="Arraste um arquivo PDF" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-800">Arquivo selecionado</span>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <RotateCcw size={14} /> Novo arquivo
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-lg"><FileText size={32} className="text-red-500" /></div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tamanho: {formatFileSize(file.size)}</p>
                </div>
              </div>
              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">PDF protegido com sucesso!</p>
                  <p className="text-xs text-green-600 mt-1">Tamanho: {formatFileSize(result.size)}</p>
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Senha do Usuário *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    placeholder="Senha para abrir o PDF"
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800 mb-1 block">Senha do Proprietário</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={ownerPassword}
                  onChange={e => setOwnerPassword(e.target.value)}
                  placeholder="Opcional (padrão: mesma do usuário)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Permissões</h3>
              <div className="space-y-2">
                {[
                  { key: 'print', label: 'Permitir impressão' },
                  { key: 'copy', label: 'Permitir cópia de texto' },
                  { key: 'edit', label: 'Permitir edição' },
                ].map(p => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={permissions[p.key]} onChange={() => togglePermission(p.key)} className="rounded" />
                    <span className="text-sm text-slate-800">{p.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Button onClick={handleProtect} disabled={processing || !userPassword} className="w-full" size="lg">
              {processing ? <><LoadingSpinner size={18} /> Protegendo...</> : 'Proteger PDF'}
            </Button>

            <DownloadButton blob={result} filename={`protegido_${file?.name}`} />
          </div>
        </div>
      )}
    </ToolPageLayout>
  )
}
