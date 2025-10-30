import { Outcome } from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'


type Main = string | Text
type Args = []
type Output = Types.Tree.RestingValue

export const get = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'get',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: (main, _args, { sourceTree }) => {
    const { makeSuccess, makeFailure } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    const strName = Cast.toString(main)
    const found = sourceTree.getVariable(strName)
    if (found === undefined) return makeFailure(makeTransformationError(`No variable stored under the name '${strName}'`))
    return makeSuccess(found)
  }
})
