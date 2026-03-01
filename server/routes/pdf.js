import { Router } from 'express'
import multer from 'multer'
import { compressPdf } from '../services/pdfCompress.js'
import { protectPdf } from '../services/pdfProtect.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos PDF são aceitos'))
    }
  },
})

router.post('/compress', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    const level = req.body.level || 'ebook'
    const validLevels = ['screen', 'ebook', 'printer']
    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: 'Nível de compressão inválido' })
    }

    const result = await compressPdf(req.file.buffer, level)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comprimido.pdf"`,
      'Content-Length': result.length,
    })
    res.send(result)
  } catch (err) {
    console.error('PDF compress error:', err.message)
    res.status(500).json({ error: 'Erro ao comprimir o PDF' })
  }
})

router.post('/protect', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    const { userPassword, ownerPassword } = req.body
    if (!userPassword) {
      return res.status(400).json({ error: 'Senha do usuário é obrigatória' })
    }

    let permissions = {}
    try {
      permissions = JSON.parse(req.body.permissions || '{}')
    } catch {}

    const result = await protectPdf(req.file.buffer, userPassword, ownerPassword || userPassword, permissions)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="protegido.pdf"`,
      'Content-Length': result.length,
    })
    res.send(result)
  } catch (err) {
    console.error('PDF protect error:', err.message)
    res.status(500).json({ error: 'Erro ao proteger o PDF' })
  }
})

export default router
