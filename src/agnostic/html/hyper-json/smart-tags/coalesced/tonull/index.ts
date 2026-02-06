import * as Outcome from '../../../../../misc/outcome/index.js'
import { type Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

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
