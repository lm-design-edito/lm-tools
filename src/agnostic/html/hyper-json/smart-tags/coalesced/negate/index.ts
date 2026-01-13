import * as Outcome from '../../../../../misc/outcome/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = boolean
type Args = []
type Output = boolean

export const negate = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'negate',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'boolean'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => Outcome.makeSuccess(!main)
})
