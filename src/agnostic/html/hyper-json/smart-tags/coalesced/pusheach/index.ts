import * as Outcome from '../../../../../misc/outcome/index.js'
import type { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingArrayValue
type Args = Types.Tree.RestingArrayValue[]
type Output = Types.Tree.RestingArrayValue

export const pusheach = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'pusheach',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => {
    const { makeSuccess, makeFailure } = Outcome
    const { typeCheck } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    for (const [argPos, arg] of Object.entries(a)) {
      const numPos = parseInt(argPos)
      const checked = typeCheck(arg, 'array')
      if (!checked.success) return makeFailure(makeArgsValueError(
        checked.error.expected,
        checked.error.found,
        numPos
      ))
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- each entry was typeCheck'd in the loop above; TS can't verify a generic Args from a runtime check
    return makeSuccess(a as Args)
  },
  func: (main, args) => {
    const returned = [...main]
    for (const arg of args) { returned.push(...arg) }
    return Outcome.makeSuccess(returned)
  }
})
