import { Outcome } from '~/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = boolean
type Args = [
  then: Types.Tree.RestingValue,
  otherwise: Types.Tree.RestingValue
]
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
    return makeSuccess(a as Args)
  },
  func: (main, args) => {
    const [then, otherwise] = args
    return Outcome.makeSuccess(main ? then : otherwise)
  }
})
