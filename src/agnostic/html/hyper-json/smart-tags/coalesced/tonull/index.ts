import { Outcome } from '../../../../../misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = []
type Output = null

export const tonull = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'tonull',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: () => Outcome.makeSuccess(null)
})
