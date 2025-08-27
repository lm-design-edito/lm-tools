import sharp from 'sharp'
import z from 'zod'

export type SaturateOperationParams = {
  saturation?: number
}

export function isSaturateOperationParams (obj: unknown): obj is SaturateOperationParams {
  return z.object({
    saturation: z.number().optional()
  }).safeParse(obj).success
}

export async function saturate (
  sharpInstance: sharp.Sharp,
  params: SaturateOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ saturation: params.saturation })
}
