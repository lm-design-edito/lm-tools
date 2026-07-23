import type { Sharp } from 'sharp'

export async function flip (sharpInstance: Sharp): Promise<Sharp> {
  return sharpInstance.flip()
}
