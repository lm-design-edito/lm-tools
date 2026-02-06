import type sharp from 'sharp'
import z from 'zod'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { isColor } from '../../../../../agnostic/colors/typechecks/index.js'
import { type Color } from '../../../../../agnostic/colors/types.js'
import { toSharpColor } from '../../../utils/index.js'
import type { ExtendOperationParams } from '../../../types.js'

export function isExtendOperationParams (obj: unknown): Outcome.Either<ExtendOperationParams, string> {
  const schema = z.object({
    left: z.number().optional(),
    right: z.number().optional(),
    top: z.number().optional(),
    bottom: z.number().optional(),
    extendWith: z.optional(z.enum(['background', 'copy', 'repeat', 'mirror'])),
    background: z.custom<Color>(isColor).optional()
  })
  const result = schema.safeParse(obj)
  if (!result.success) return Outcome.makeFailure(result.error.message)
  return Outcome.makeSuccess(result.data)
}

export async function extend (
  sharpInstance: sharp.Sharp,
  params: ExtendOperationParams
): Promise<sharp.Sharp> {
  return sharpInstance.extend({
    ...params,
    background: params.background !== undefined
      ? toSharpColor(params.background)
      : undefined
  })
}
