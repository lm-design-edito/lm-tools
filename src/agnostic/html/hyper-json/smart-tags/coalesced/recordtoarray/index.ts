import * as Outcome from '../../../../../misc/outcome/index.js'
import { Utils } from '../../../utils/index.js'
import { Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingRecordValue
type Args = []
type Output = Types.Tree.RestingArrayValue

export const recordtoarray = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'recordtoarray',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => Outcome.makeSuccess(Object.values(main))
})
