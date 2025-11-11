import sharp from 'sharp'
import z from 'zod'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { Color } from '../../../../../agnostic/colors/types.js'
import { isColor } from '../../../../../agnostic/colors/typechecks/index.js'
import { toSharpColor } from '../../../utils/index.js'
import type { FlattenOperationParams } from '../../../types.js'

export function isFlattenOperationParams (obj: unknown): Outcome.Either<FlattenOperationParams, string> {
  const schema = z.object({
    background: z.custom<Color>(isColor).optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function flatten (
  sharpInstance: sharp.Sharp,
  params: FlattenOperationParams
): Promise<sharp.Sharp> {
  const inputBg = params.background
  const rgbBackground = inputBg !== undefined ? toSharpColor(inputBg) : undefined
  const background = rgbBackground !== undefined ? rgbBackground : undefined
  return sharpInstance.flatten({ background })
}
