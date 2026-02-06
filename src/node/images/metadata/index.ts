import type sharp from 'sharp'
import { toSharpInstance } from '../utils/index.js'
import type { ImageLike } from '../types.js'

/**
 * Retrieves metadata from an image.
 *
 * @param imageInput - The image to get metadata from. Can be a Sharp instance, Buffer, CreateOptions, or file path.
 * @returns Image metadata including dimensions, format, color space, and other properties.
 */
export async function metadata (imageInput: ImageLike): Promise<sharp.Metadata> {
  const sharpInstance = await toSharpInstance(imageInput)
  return await sharpInstance.metadata()
}
