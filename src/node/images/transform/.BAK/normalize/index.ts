import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type NormalizeOperationParams = {
  lower: number
  upper: number
}

export type NormalizeOperation = {
  name: typeof OperationNames.Normalize,
  params: NormalizeOperationParams
}

export const normalizeSchema: zod.ZodType<NormalizeOperation> = zod.object({
  name: zod.literal(OperationNames.Normalize),
  params: zod.object({
    lower: zod.number(),
    upper: zod.number()
  })
})
