import * as Outcome from '../../../../../misc/outcome/index.js'
import type { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = boolean
type Args = [
  then: Types.Tree.RestingValue,
  otherwise: Types.Tree.RestingValue
]
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
type Output = Args[0] | Args[1]

export const ifFunc = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'if',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'boolean'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    if (a.length > 2) return makeFailure(makeArgsValueError('value', 'undefined', a.length))
    if (a.length < 2) return makeFailure(makeArgsValueError('undefined', 'value', 2))
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- length checked just above; TS can't verify a generic Args tuple from a runtime length check
    return makeSuccess(a as Args)
  },
  func: (main, args) => {
    const [then, otherwise] = args
    return Outcome.makeSuccess(main ? then : otherwise)
  }
})
