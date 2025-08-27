import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type LineateLevelsOperationParams = {
  multiplier: number | [number, number, number]
  offset?: number | [number, number, number]
}

export type LineateLevelsOperation = {
  name: typeof OperationNames.LineateLevels,
  params: LineateLevelsOperationParams
}

export const lineateLevelsSchema: zod.ZodType<LineateLevelsOperation> = zod.object({
  name: zod.literal(OperationNames.LineateLevels),
  params: zod.object({
    multiplier: zod.union([
      zod.number(),
      zod.tuple([
        zod.number(),
        zod.number(),
        zod.number()
      ])
    ]),
    offset: zod.optional(
      zod.union([
        zod.number(),
        zod.tuple([
          zod.number(),
          zod.number(),
          zod.number()
        ])]))
  })
})
