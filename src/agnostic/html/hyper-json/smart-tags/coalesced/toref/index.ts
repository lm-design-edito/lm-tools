import * as Outcome from '../../../../../misc/outcome/index.js'
import { type Types } from '../../../types/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'
import { func as refFunc } from '../../isolated/ref/index.js'

type Main = Types.Tree.RestingValue
type Args = []
type Output = Types.Tree.RestingValue

export const toref = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toref',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: (main, args, details) => refFunc(Cast.toString(main), args, details)
})
