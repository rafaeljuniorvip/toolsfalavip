import { execFile } from 'child_process'
import { writeFile, readFile, unlink, mkdtemp } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

export async function compressPdf(buffer, level = 'ebook') {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'pdf-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  const outputPath = path.join(tempDir, 'output.pdf')

  try {
    await writeFile(inputPath, buffer)

    await new Promise((resolve, reject) => {
      execFile('gs', [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-sDEVICE=pdfwrite',
        `-dPDFSETTINGS=/${level}`,
        '-dCompatibilityLevel=1.7',
        `-sOutputFile=${outputPath}`,
        inputPath,
      ], { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) reject(new Error(`Ghostscript error: ${stderr || error.message}`))
        else resolve()
      })
    })

    const result = await readFile(outputPath)
    return result
  } finally {
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
    await unlink(tempDir).catch(() => {})
  }
}
