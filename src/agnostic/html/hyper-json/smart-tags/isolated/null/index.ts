import * as Outcome from '../../../../../misc/outcome/index.js'
import { type Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

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
