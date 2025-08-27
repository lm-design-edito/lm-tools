import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type BrightenOperationParams = number

export type BrightenOperation = {
  name: typeof OperationNames.Brighten,
  params: BrightenOperationParams
}

export const brightenSchema: zod.ZodType<BrightenOperation> = zod.object({
  name: zod.literal(OperationNames.Brighten),
  params: zod.number().min(0)
})
