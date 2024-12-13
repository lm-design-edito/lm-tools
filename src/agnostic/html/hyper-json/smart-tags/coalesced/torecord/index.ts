import { Outcome } from '~/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = []
type Output = Types.Tree.RestingRecordValue

export const torecord = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'torecord',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => Outcome.makeSuccess(Cast.toRecord(main))
})
