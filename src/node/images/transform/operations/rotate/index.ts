import sharp from 'sharp'
import z from 'zod'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import type { Color } from '../../../../../agnostic/colors/types.js'
import { isColor } from '../../../../../agnostic/colors/typechecks/index.js'
import { toSharpColor } from '../../../utils/index.js'
import type { RotateOperationParams } from '../../../types.js'

export function isRotateOperationParams (obj: unknown): Outcome.Either<RotateOperationParams, string> {
  const schema = z.object({
    angleDeg: z.number().optional(),
    background: z.custom<Color>(isColor).optional(),
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function rotate (
  sharpInstance: sharp.Sharp,
  params: RotateOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.rotate(params.angleDeg, {
    background: params.background !== undefined
      ? toSharpColor(params.background)
      : undefined
  })
}
