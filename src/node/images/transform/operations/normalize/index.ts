import type { Sharp } from 'sharp'
import z from 'zod'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import type { NormalizeOperationParams } from '../../../types.js'

export function isNormalizeOperationParams (obj: unknown): Outcome.Either<NormalizeOperationParams, string> {
  const schema = z.object({
    lower: z.number().optional(),
    upper: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function normalize (
  sharpInstance: Sharp,
  params: NormalizeOperationParams
): Promise<Sharp> {
  return sharpInstance.normalize(params)
}
