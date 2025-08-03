import { Outcome } from '../../../../../misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'


type Main = Types.Tree.RestingValue // [WIP] Main is ignored in all cases, should typecheck that?
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingRecordValue

export const global = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'global',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: (_m, _a, { sourceTree }) => {
    const globalObject = sourceTree.options.globalObject ?? {}
    return Outcome.makeSuccess({ ...globalObject })
  }
})
