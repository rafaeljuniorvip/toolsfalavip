import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Resize from './pages/Resize'
import Crop from './pages/Crop'
import Convert from './pages/Convert'
import RotateFlip from './pages/RotateFlip'
import Adjust from './pages/Adjust'
import Filters from './pages/Filters'
import Watermark from './pages/Watermark'
import ImageCompress from './pages/ImageCompress'
import ImagesToPdf from './pages/ImagesToPdf'
import ImageBorder from './pages/ImageBorder'
import ImageToBase64 from './pages/ImageToBase64'
import Base64ToImage from './pages/Base64ToImage'
import MemeGenerator from './pages/MemeGenerator'
import RoundedCorners from './pages/RoundedCorners'
import PdfCompress from './pages/PdfCompress'
import PdfMerge from './pages/PdfMerge'
import PdfSplit from './pages/PdfSplit'
import PdfRotate from './pages/PdfRotate'
import PdfWatermark from './pages/PdfWatermark'
import PdfReorder from './pages/PdfReorder'
import PdfToImages from './pages/PdfToImages'
import PdfProtect from './pages/PdfProtect'
import QrCodeGenerator from './pages/QrCodeGenerator'
import ColorExtractor from './pages/ColorExtractor'
import ColorPalette from './pages/ColorPalette'
import LoremIpsum from './pages/LoremIpsum'
import UnitConverter from './pages/UnitConverter'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        {/* Imagem */}
        <Route path="redimensionar" element={<Resize />} />
        <Route path="recortar" element={<Crop />} />
        <Route path="converter" element={<Convert />} />
        <Route path="girar" element={<RotateFlip />} />
        <Route path="ajustar" element={<Adjust />} />
        <Route path="filtros" element={<Filters />} />
        <Route path="marca-dagua" element={<Watermark />} />
        <Route path="comprimir-imagem" element={<ImageCompress />} />
        <Route path="moldura" element={<ImageBorder />} />
        <Route path="imagem-para-base64" element={<ImageToBase64 />} />
        <Route path="base64-para-imagem" element={<Base64ToImage />} />
        <Route path="meme" element={<MemeGenerator />} />
        <Route path="cantos-arredondados" element={<RoundedCorners />} />
        {/* PDF */}
        <Route path="pdf-comprimir" element={<PdfCompress />} />
        <Route path="pdf-juntar" element={<PdfMerge />} />
        <Route path="pdf-dividir" element={<PdfSplit />} />
        <Route path="pdf-girar" element={<PdfRotate />} />
        <Route path="imagens-para-pdf" element={<ImagesToPdf />} />
        <Route path="pdf-marca-dagua" element={<PdfWatermark />} />
        <Route path="pdf-reordenar" element={<PdfReorder />} />
        <Route path="pdf-para-imagens" element={<PdfToImages />} />
        <Route path="pdf-proteger" element={<PdfProtect />} />
        {/* Utilidades */}
        <Route path="qrcode" element={<QrCodeGenerator />} />
        <Route path="extrair-cores" element={<ColorExtractor />} />
        <Route path="paleta-cores" element={<ColorPalette />} />
        <Route path="lorem-ipsum" element={<LoremIpsum />} />
        <Route path="conversor" element={<UnitConverter />} />
      </Route>
    </Routes>
  )
}
