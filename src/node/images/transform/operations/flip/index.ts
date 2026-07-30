import type { Sharp } from 'sharp'

// eslint-disable-next-line @typescript-eslint/require-await
export async function flip (sharpInstance: Sharp): Promise<Sharp> {
  return sharpInstance.flip()
}
