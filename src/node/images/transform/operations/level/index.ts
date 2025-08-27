import sharp from 'sharp'
import z from 'zod'

export type LevelOperationParams = {
  multiplier?: number
  offset?: number
}

export function isLevelOperationParams (obj: unknown): obj is LevelOperationParams {
  return z.object({
    multiplier: z.number().optional(),
    offset: z.number().optional()
  }).safeParse(obj).success
}

export async function level (
  sharpInstance: sharp.Sharp,
  params: LevelOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.linear(
    params.multiplier,
    params.offset
  )
}
