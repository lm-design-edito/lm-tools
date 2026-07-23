import type { Sharp } from 'sharp'
import z from 'zod'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import type { LevelOperationParams } from '../../../types.js'

export function isLevelOperationParams (obj: unknown): Outcome.Either<LevelOperationParams, string> {
  const schema = z.object({
    multiplier: z.number().optional(),
    offset: z.number().optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function level (
  sharpInstance: Sharp,
  params: LevelOperationParams
): Promise<Sharp> {
  return sharpInstance.linear(
    params.multiplier,
    params.offset
  )
}
