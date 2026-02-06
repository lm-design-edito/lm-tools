import type sharp from 'sharp'
import z from 'zod'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import type { BrightenOperationParams } from '../../../types.js'

export function isBrightenOperationParams (obj: unknown): Outcome.Either<BrightenOperationParams, string> {
  const schema = z.object({ factor: z.number() })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function brighten (
  sharpInstance: sharp.Sharp,
  params: BrightenOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.modulate({ brightness: params.factor })
}
