import sharp, { Color } from 'sharp'
import zod from 'zod'

import { colorSchema } from '../_utils/color-schema'
import { OperationNames } from '../_utils/operation-names'

export type ResizeOperationParams = {
  width: number
  height: number
  options?: {
    background?: Color
    fit?: keyof sharp.FitEnum
  }
}

export type ResizeOperation = {
  name: typeof OperationNames.Resize,
  params: ResizeOperationParams
}

export const resizeSchema: zod.ZodType<ResizeOperation> = zod.object({
  name: zod.literal(OperationNames.Resize),
  params: zod.object({
    width: zod.number().min(0),
    height: zod.number().min(0),
    options: zod.object({
      background: zod.optional(colorSchema),
      fit: zod.enum([
        'contain',
        'cover',
        'fill',
        'inside',
        'outside'
      ]).optional()
    }).optional()
  })
})