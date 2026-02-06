import * as Outcome from '../../../../../misc/outcome/index.js'
import { type Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingArrayValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingArrayValue

export const push = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'push',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => Outcome.makeSuccess([...main, ...args])
})
