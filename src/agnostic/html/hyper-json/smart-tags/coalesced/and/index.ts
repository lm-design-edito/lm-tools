import { Outcome } from '../../../../../misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = boolean

export const and = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'and',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => {
    const all = [main, ...args]
    const returned = all.every(Cast.toBoolean)
    return Outcome.makeSuccess(returned)
  }
})
