import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import type { BlurOperationParams } from '../../../types.js'

export function isBlurOperationParams (obj: unknown): Outcome.Either<BlurOperationParams, string> {
  const schema = z.object({ sigma: z.number() })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function blur (
  sharpInstance: sharp.Sharp,
  params: BlurOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.blur(params.sigma)
}
