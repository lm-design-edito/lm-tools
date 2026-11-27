import * as Outcome from '../../../../../misc/outcome/index.js'
import type { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.MethodValue | Types.Tree.MethodValue[]
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingValue

export const call = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'call',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => {
    const { makeFailure } = Outcome
    const { typeCheck, typeCheckMany, getType } = Utils.Tree.TypeChecks
    const { makeMainValueError } = Utils.SmartTags
    const isMethodCheck = typeCheck(m, 'method')
    if (isMethodCheck.success) return isMethodCheck
    if (!Array.isArray(m)) return makeFailure({
      expected: 'method[]',
      found: getType(m) ?? 'undefined'
    })
    const isMethodsArrayCheck = typeCheckMany(m, 'method')
    if (isMethodsArrayCheck.success) return isMethodsArrayCheck
    return makeFailure(makeMainValueError('method | method[]', getType(m)))
  },
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'array'),
  func: (main, args) => {
    const { makeFailure } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    return makeFailure(makeTransformationError({
      message: 'This smart tag should not be used.'
    }))
  }
})
