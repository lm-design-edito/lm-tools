import { Outcome } from '../../../../../misc/outcome'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = null

export const nullFunc = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'null',
  defaultMode: 'isolation',
  isolationInitType: 'null',
  mainValueCheck: i => ({ success: true, payload: i }),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: () => Outcome.makeSuccess(null)
})
