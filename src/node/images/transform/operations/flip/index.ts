import type sharp from 'sharp'

export async function flip (sharpInstance: sharp.Sharp): Promise<sharp.Sharp> {
  return sharpInstance.flip()
}
