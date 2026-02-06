import * as Outcome from '../../../../../misc/outcome/index.js'
import { type Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingValue

export const any = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'any',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => {
    if (args.length === 0) return Outcome.makeSuccess(main)
    return Outcome.makeSuccess([main, ...args])
  }
})
