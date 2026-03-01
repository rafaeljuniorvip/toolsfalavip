import { useState, useRef } from 'react'
import { Upload, Image, FileText } from 'lucide-react'

export default function DropZone({ onFiles, accept = 'image/*', multiple = false, label, maxSize = 50 }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef()

  const isImage = accept.includes('image')
  const isPdf = accept.includes('pdf')

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOut = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(multiple ? files : [files[0]])
  }

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onFiles(multiple ? files : [files[0]])
    e.target.value = ''
  }

  const Icon = isPdf ? FileText : Image

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl cursor-pointer transition-all duration-200
        ${isDragging
          ? 'dropzone-gradient-border-active scale-[1.02] shadow-lg shadow-blue-600/10'
          : 'dropzone-gradient-border hover:shadow-md hover:scale-[1.005]'
        }`}
    >
      <div className={`p-4 rounded-2xl transition-all duration-200 ${isDragging ? 'bg-blue-100 scale-110' : 'bg-slate-100'}`}>
        {isDragging ? <Upload size={32} className="text-blue-600" /> : <Icon size={32} className="text-slate-400" />}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">
          {label || (isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste um arquivo')}
        </p>
        <p className="text-xs text-slate-400 mt-1.5">
          {isImage && 'PNG, JPG, WebP, GIF'}
          {isPdf && 'Arquivo PDF'}
          {' '}
          (max {maxSize}MB)
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
