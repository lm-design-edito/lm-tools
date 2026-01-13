import * as Outcome from '../../../../../misc/outcome/index.js'
import { Types } from '../../../types/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = []
type Output = Types.Tree.RestingArrayValue

export const toarray = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toarray',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => Outcome.makeSuccess(Cast.toArray(main))
})
