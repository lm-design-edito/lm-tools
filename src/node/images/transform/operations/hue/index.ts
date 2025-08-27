import sharp from 'sharp'
import z from 'zod'

export type HueOperationParams = {
  rotateDeg?: number
}

export function isHueOperationParams (obj: unknown): obj is HueOperationParams {
  return z.object({
    rotateDeg: z.number().optional()
  }).safeParse(obj).success
}

export async function hue (
  sharpInstance: sharp.Sharp,
  params: HueOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ hue: params.rotateDeg })
}
