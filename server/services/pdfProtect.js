import { execFile } from 'child_process'
import { writeFile, readFile, unlink, mkdtemp } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

export async function protectPdf(buffer, userPassword, ownerPassword, permissions = {}) {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'pdf-protect-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  const outputPath = path.join(tempDir, 'output.pdf')

  try {
    await writeFile(inputPath, buffer)

    const args = [
      '-q',
      '-dNOPAUSE',
      '-dBATCH',
      '-dSAFER',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.7',
      `-sOwnerPassword=${ownerPassword || userPassword}`,
      `-sUserPassword=${userPassword}`,
    ]

    // Permission flags
    let permBits = -3904 // Default: all restricted
    if (permissions.print) permBits |= 4
    if (permissions.copy) permBits |= 16
    if (permissions.edit) permBits |= 8

    args.push(`-dPermissions=${permBits}`)
    args.push('-dEncryptionR=3')
    args.push('-dKeyLength=128')
    args.push(`-sOutputFile=${outputPath}`)
    args.push(inputPath)

    await new Promise((resolve, reject) => {
      execFile('gs', args, { timeout: 60000 }, (error, stdout, stderr) => {
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
