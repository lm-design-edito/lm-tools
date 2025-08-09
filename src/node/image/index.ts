import path from 'node:path'
import fetch from 'node-fetch'
// import getColors from 'get-image-colors' // [WIP] get-image-colors is unsafe, fing replacement
import fse from 'fs-extra'
import sharp from 'sharp'

/* * * * * * * * * * * * * * * 
 *
 * GET IMAGE COLORS FROM URL
 * 
 * * * * * * * * * * * * * * */

// [WIP] get-image-colors is unsafe, fing replacement
export async function getImageColorsFromUrl (url: string) {
  console.warn('get-image-colors lib is unsafe')
  // const data = await fetch(url)
  // const blob = await data.blob()
  // const arrayBuffer = await blob.arrayBuffer()
  // const buffer = Buffer.from(arrayBuffer)
  // const colors = await getColors(buffer, blob.type)
  // const result = colors.map(color => color.hex())
  // return result
}

/* * * * * * * * * * * * * * * 
 *
 * COMPRESS IMAGES
 * 
 * * * * * * * * * * * * * * */

export const compressorExtensions = {
  jpgExtensions: ['.jpg', '.jpeg'],
  pngExtensions: ['.png'],
  webpExtensions: ['.wepb'],
  avifExtensions: ['.avif', '.avifs'],
  heifExtensions: ['.heif', '.heifs', '.hif']
}

export async function compressImages (
  src: string,
  preExtension: string,
  sizes: number[] = [],
  qualities: number[]|number = 100
) {

  if (!path.isAbsolute(src)) throw new Error('Source path must be absolute.')
  const files = await fse.readdir(src)

  const {
    jpgExtensions,
    pngExtensions,
    webpExtensions,
    avifExtensions,
    heifExtensions
  } = compressorExtensions
  
  const allowedExtensions = [
    ...jpgExtensions,
    ...pngExtensions,
    ...webpExtensions,
    ...avifExtensions,
    ...heifExtensions
  ].flat()

  for (const file of files) {
    const filePath = path.join(src, file)
    const isDirectory = (await fse.stat(filePath)).isDirectory()
    if (isDirectory) continue
    
    const ext = path.extname(file)
    const extIsAllowed = allowedExtensions.includes(ext.toLowerCase())
    if (!extIsAllowed) continue

    const nameWithPreExt = file.replace(new RegExp(`${ext}$`), '')
    let matchedPreExt = nameWithPreExt.split('.').slice(1).slice(-1)[0] ?? ''
    const preExt = matchedPreExt === '' ? matchedPreExt : `.${matchedPreExt}`
    if (preExt === preExtension) continue

    const name = nameWithPreExt.replace(new RegExp(`${preExtension}$`), '')
    for (const sizePos in sizes) {
      const size = sizes[sizePos]
      const dstFile = `${name}.${size}${preExtension}${ext}`
      const dstFilePath = path.join(src, dstFile)
      
      const quality = Array.isArray(qualities)
        ? qualities[sizePos] ?? qualities.slice(-1)[0] ?? 100
        : qualities
      const resized = sharp(filePath)
        .withMetadata()
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })

      if (jpgExtensions.includes(ext)) await resized.jpeg({ quality }).toFile(dstFilePath)
      if (pngExtensions.includes(ext)) await resized.png({ quality }).toFile(dstFilePath)
      if (webpExtensions.includes(ext)) await resized.webp({ quality }).toFile(dstFilePath)
      if (avifExtensions.includes(ext)) await resized.avif({ quality }).toFile(dstFilePath)
      if (heifExtensions.includes(ext)) await resized.heif({ quality }).toFile(dstFilePath)
      
      console.log(dstFilePath)
      console.log('size', size)
      console.log('quality', quality)
      console.log('poids', (await fse.stat(dstFilePath)).size)
    }
  }
}
