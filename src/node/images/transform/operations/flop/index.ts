import type { Sharp } from 'sharp'

export async function flop (sharpInstance: Sharp): Promise<Sharp> {
  return sharpInstance.flop()
}
