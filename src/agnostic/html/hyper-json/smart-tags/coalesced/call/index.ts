import * as Outcome from '../../../../../misc/outcome/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.MethodValue | Types.Tree.MethodValue[]
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingValue

// [WIP] this is not useful as is, hyper-json cannot support
// function defintion/calls logic
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
    return makeFailure(makeMainValueError('method | method[]', getType(m) ?? 'undefined'))
  },
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'array'),
  func: (main, args) => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    return makeFailure(makeTransformationError({
      message: 'This smart tag should not be used.'
    }))
    // const mainArr = Array.isArray(main) ? main : [main]
    // let reduced: Types.Tree.RestingValue = args
    // for (const method of mainArr) {
    //   const { transformer } = method
    //   const applied = transformer.apply(reduced)
    //   if (applied.success) { reduced = applied.payload }
    //   return makeFailure(makeTransformationError({
    //     message: 'Subtransformation failure.',
    //     onTransformed: reduced,
    //     transformerAt: mainArr.indexOf(method),
    //     transformerName: transformer.name,
    //     transformerOutput: applied
    //   }))
    // }
    // return makeSuccess(reduced)
  }
})
