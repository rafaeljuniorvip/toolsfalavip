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
import PdfCompress from './pages/PdfCompress'
import PdfMerge from './pages/PdfMerge'
import PdfSplit from './pages/PdfSplit'
import PdfRotate from './pages/PdfRotate'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="redimensionar" element={<Resize />} />
        <Route path="recortar" element={<Crop />} />
        <Route path="converter" element={<Convert />} />
        <Route path="girar" element={<RotateFlip />} />
        <Route path="ajustar" element={<Adjust />} />
        <Route path="filtros" element={<Filters />} />
        <Route path="marca-dagua" element={<Watermark />} />
        <Route path="pdf-comprimir" element={<PdfCompress />} />
        <Route path="pdf-juntar" element={<PdfMerge />} />
        <Route path="pdf-dividir" element={<PdfSplit />} />
        <Route path="pdf-girar" element={<PdfRotate />} />
      </Route>
    </Routes>
  )
}
