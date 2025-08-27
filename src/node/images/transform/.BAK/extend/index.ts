import sharp, { Color } from 'sharp'
import zod from 'zod'

import { colorSchema } from '../_utils/color-schema'
import { OperationNames } from '../_utils/operation-names'

export type ExtendOperationParams = {
  left: number,
  right: number
  top: number,
  bottom: number,
  extendWith?: sharp.ExtendWith,
  background?: Color
}

export type ExtendOperation = {
  name: typeof OperationNames.Extend,
  params: ExtendOperationParams
}

export const extendSchema: zod.ZodType<ExtendOperation> = zod.object({
  name: zod.literal(OperationNames.Extend),
  params: zod.object({
    top: zod.number(),
    left: zod.number(),
    right: zod.number(),
    bottom: zod.number(),
    background: colorSchema,
    extendWith: zod.optional(zod.enum([
      'background',
      'copy',
      'repeat',
      'mirror'
    ]))
  })
})
