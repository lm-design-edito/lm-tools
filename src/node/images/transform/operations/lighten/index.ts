import sharp from 'sharp'
import z from 'zod'

export type LightenOperationParams = {
  amount?: number
}

export function isLightenOperationParams (obj: unknown): obj is LightenOperationParams {
  return z.object({
    amount: z.number().optional()
  }).safeParse(obj).success
}

export async function lighten (
  sharpInstance: sharp.Sharp,
  params: LightenOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ lightness: params.amount })
}
