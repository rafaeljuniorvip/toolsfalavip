import { useState } from 'react'
import ToolPageLayout from '../components/shared/ToolPageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import { Copy, Check } from 'lucide-react'

const LOREM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
  'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
  'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.',
]

const typeOptions = [
  { value: 'paragraphs', label: 'Parágrafos' },
  { value: 'sentences', label: 'Frases' },
  { value: 'words', label: 'Palavras' },
]

export default function LoremIpsum() {
  const [type, setType] = useState('paragraphs')
  const [count, setCount] = useState(3)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    let result = ''
    if (type === 'paragraphs') {
      const paragraphs = []
      for (let i = 0; i < count; i++) {
        paragraphs.push(LOREM[i % LOREM.length])
      }
      result = paragraphs.join('\n\n')
    } else if (type === 'sentences') {
      const allSentences = LOREM.join(' ').split('. ').map(s => s.trim().replace(/\.$/, '') + '.')
      const sentences = []
      for (let i = 0; i < count; i++) {
        sentences.push(allSentences[i % allSentences.length])
      }
      result = sentences.join(' ')
    } else {
      const allWords = LOREM.join(' ').split(/\s+/)
      const words = []
      for (let i = 0; i < count; i++) {
        words.push(allWords[i % allWords.length])
      }
      result = words.join(' ')
    }
    setOutput(result)
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolPageLayout title="Lorem Ipsum" description="Gere texto placeholder para seus layouts e projetos">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-800">Texto Gerado</span>
              {output && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <><Check size={14} className="text-green-600" /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                </Button>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Clique em 'Gerar' para criar o texto..."
              rows={16}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none resize-none bg-gray-50 leading-relaxed"
            />
            {output && (
              <p className="mt-2 text-xs text-slate-500">
                {output.split(/\s+/).length} palavras - {output.length} caracteres
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <Select label="Tipo" value={type} onChange={v => { setType(v); setOutput('') }} options={typeOptions} />
          </Card>

          <Card>
            <label className="text-sm font-medium text-slate-800 mb-1 block">
              Quantidade de {type === 'paragraphs' ? 'parágrafos' : type === 'sentences' ? 'frases' : 'palavras'}
            </label>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={type === 'words' ? 1000 : 50}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </Card>

          <Button onClick={generate} className="w-full" size="lg">
            Gerar
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  )
}
