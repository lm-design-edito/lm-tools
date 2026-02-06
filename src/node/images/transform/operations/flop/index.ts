import type sharp from 'sharp'

export async function flop (sharpInstance: sharp.Sharp): Promise<sharp.Sharp> {
  return sharpInstance.flop()
}
