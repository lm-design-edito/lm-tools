import zod from 'zod'
import { colorSchema } from '../_utils/color-schema'
import { OperationNames } from '../_utils/operation-names'
import { Color } from 'sharp'

export type FlattenOperationParams = {
  background: Color
}

export type FlattenOperation = {
  name: typeof OperationNames.Flatten,
  params: FlattenOperationParams
}

export const flattenSchema: zod.ZodType<FlattenOperation> = zod.object({
  name: zod.literal(OperationNames.Flatten),
  params: zod.object({
    background: colorSchema
  })
})
