import sharp from 'sharp'
import z from 'zod'

export type BlurOperationParams = {
  sigma: number
}

export function isBlurOperationParams (obj: unknown): obj is BlurOperationParams {
  return z
    .object({ sigma: z.number() })
    .safeParse(obj)
    .success
}

export async function blur (
  sharpInstance: sharp.Sharp,
  params: BlurOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.blur(params.sigma)
}
