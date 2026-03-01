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
      className={`relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all
        ${isDragging
          ? 'border-blue-600 bg-blue-50 scale-[1.01]'
          : 'border-slate-200 hover:border-blue-600/40 hover:bg-gray-50'
        }`}
    >
      <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-600/10' : 'bg-gray-100'}`}>
        {isDragging ? <Upload size={28} className="text-blue-600" /> : <Icon size={28} className="text-slate-500" />}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-800">
          {label || (isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste um arquivo')}
        </p>
        <p className="text-xs text-slate-500 mt-1">
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
