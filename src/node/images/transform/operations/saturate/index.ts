import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import type { SaturateOperationParams } from '../../../types.js'

export function isSaturateOperationParams (obj: unknown): Outcome.Either<SaturateOperationParams, string> {
  const schema = z.object({
    saturation: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function saturate (
  sharpInstance: sharp.Sharp,
  params: SaturateOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({
    saturation: params.saturation
  })
}
