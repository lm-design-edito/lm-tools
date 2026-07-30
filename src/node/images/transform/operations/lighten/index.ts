import type { Sharp } from 'sharp'
import z from 'zod'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import type { LightenOperationParams } from '../../../types.js'

export function isLightenOperationParams (obj: unknown): Outcome.Either<LightenOperationParams, string> {
  const schema = z.object({
    amount: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function lighten (
  sharpInstance: Sharp,
  params: LightenOperationParams
): Promise<Sharp> {
  return sharpInstance.modulate({ lightness: params.amount })
}
