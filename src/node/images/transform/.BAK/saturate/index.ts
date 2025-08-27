import zod from 'zod'

import { OperationNames } from '../_utils/operation-names'

export type SaturateOperationParams = number

export type SaturateOperation = {
  name: typeof OperationNames.Saturate
  params: SaturateOperationParams
}

export const saturateSchema: zod.ZodType<SaturateOperation> = zod.object({
  name: zod.literal(OperationNames.Saturate),
  params: zod.number().min(0)
})
