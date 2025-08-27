import zod from 'zod'

import { OperationNames } from '../_utils/operation-names'

export type ExtractOperationParams = {
  left: number,
  top: number,
  width: number
  height: number,
}

export type ExtractOperation = {
  name: typeof OperationNames.Extract,
  params: ExtractOperationParams
}

export const extractSchema: zod.ZodType<ExtractOperation> = zod.object({
  name: zod.literal(OperationNames.Extract),
  params: zod.object({
    width: zod.number(),
    height: zod.number(),
    left: zod.number(),
    top: zod.number()
  })
})
