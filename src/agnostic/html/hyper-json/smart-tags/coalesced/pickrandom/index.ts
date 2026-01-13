import * as Outcome from '../../../../../misc/outcome/index.js'
import { Utils } from '../../../utils/index.js'
import { Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingArrayValue // [WIP] string, text, array, element, nodelist ?
type Args = []
type Output = Types.Tree.RestingValue

export const pickrandom = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'pickrandom',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    const { makeSuccess, makeFailure } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    const pos = Math.floor(Math.random() * main.length)
    const found = main[pos]
    if (found === undefined) return makeFailure(makeTransformationError('Cannot pick inside empty array'))
    return makeSuccess(found!)
  }
})
