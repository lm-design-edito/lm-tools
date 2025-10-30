import { Outcome } from '../../../../../misc/outcome/index.js'
import { Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingArrayValue

export const array = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'array',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => Outcome.makeSuccess([main, ...args])
})
