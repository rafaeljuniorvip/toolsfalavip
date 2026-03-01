import { useState, useCallback, useRef } from 'react'
import { loadImageFromFile, canvasToBlob } from '../utils/fileHelpers'

export default function useImageProcessor() {
  const [originalFile, setOriginalFile] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const [processedBlob, setProcessedBlob] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  const loadImage = useCallback(async (file) => {
    try {
      setError(null)
      setProcessedBlob(null)
      setOriginalFile(file)
      const img = await loadImageFromFile(file)
      setOriginalImage(img)
      return img
    } catch {
      setError('Erro ao carregar a imagem')
      return null
    }
  }, [])

  const imageToCanvas = useCallback((img) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    canvasRef.current = canvas
    return canvas
  }, [])

  const processImage = useCallback(async (transformFn, outputType = 'image/png', quality = 0.92) => {
    if (!originalImage) return
    setIsProcessing(true)
    setError(null)
    try {
      const canvas = imageToCanvas(originalImage)
      const resultCanvas = await transformFn(canvas, originalImage)
      canvasRef.current = resultCanvas || canvas
      const blob = await canvasToBlob(canvasRef.current, outputType, quality)
      setProcessedBlob(blob)
      return blob
    } catch (err) {
      setError('Erro ao processar a imagem: ' + err.message)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [originalImage, imageToCanvas])

  const reset = useCallback(() => {
    if (originalImage?.src) URL.revokeObjectURL(originalImage.src)
    setOriginalFile(null)
    setOriginalImage(null)
    setProcessedBlob(null)
    setError(null)
    canvasRef.current = null
  }, [originalImage])

  return {
    originalFile,
    originalImage,
    processedBlob,
    isProcessing,
    error,
    canvasRef,
    loadImage,
    imageToCanvas,
    processImage,
    setProcessedBlob,
    reset,
  }
}
