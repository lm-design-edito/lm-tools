import sharp from 'sharp'
import z from 'zod'
import { isSharpColor } from '../../utils'

export type RotateOperationParams = {
  angleDeg?: number
  background?: sharp.Color
}

export function isRotateOperationParams (obj: unknown): obj is RotateOperationParams {
  return z.object({
    angleDeg: z.number().optional(),
    background: z.custom<sharp.Color>((val) => isSharpColor(val)).optional(),
  }).safeParse(obj).success
}

export async function rotate (
  sharpInstance: sharp.Sharp,
  params: RotateOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.rotate(params.angleDeg, {
    background: params.background
  })
}
