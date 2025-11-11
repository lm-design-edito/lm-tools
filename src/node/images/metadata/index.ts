import sharp from 'sharp'
import { toSharpInstance } from '../utils/index.js'
import type { ImageLike } from '../types.js'

export async function metadata (imageInput: ImageLike): Promise<sharp.Metadata> {
  const sharpInstance = await toSharpInstance(imageInput)
  return sharpInstance.metadata()
}
