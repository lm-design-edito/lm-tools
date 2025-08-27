import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type LightenOperationParams = number

export type LightenOperation = {
  name: typeof OperationNames.Lighten,
  params: LightenOperationParams
}

export const lightenSchema: zod.ZodType<LightenOperation> = zod.object({
  name: zod.literal(OperationNames.Lighten),
  params: zod.number().min(0)
})
