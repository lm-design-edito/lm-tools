import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import type { HueOperationParams } from '../../../types.js'

export function isHueOperationParams (obj: unknown): Outcome.Either<HueOperationParams, string> {
  const schema = z.object({
    rotateDeg: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function hue (
  sharpInstance: sharp.Sharp,
  params: HueOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ hue: params.rotateDeg })
}
