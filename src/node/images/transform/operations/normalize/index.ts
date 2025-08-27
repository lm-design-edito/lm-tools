import sharp from 'sharp'
import z from 'zod'

export type NormalizeOperationParams = {
  lower?: number
  upper?: number
}

export function isNormalizeOperationParams (obj: unknown): obj is NormalizeOperationParams {
  return z.object({
    lower: z.number().optional(),
    upper: z.number().optional()
  }).safeParse(obj).success
}

export async function normalize (
  sharpInstance: sharp.Sharp,
  params: NormalizeOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.normalize(params)
}
