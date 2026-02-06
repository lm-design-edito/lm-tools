import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { type Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = boolean

export const or = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'or',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => {
    const all = [main, ...args]
    const returned = all.some(Cast.toBoolean)
    return Outcome.makeSuccess(returned)
  }
})
