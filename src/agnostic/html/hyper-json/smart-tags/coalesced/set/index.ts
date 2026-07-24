import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import type { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = [string | Text] | [string | Text, Types.Tree.RestingValue]
type Output = Main

export const set = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'set',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: SmartTags.expectNotUndef,
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheck } = Utils.Tree.TypeChecks
    const first = a[0]
    if (first === undefined) return makeFailure(makeArgsValueError('string | text', 'undefined', 0))
    if (a.length > 2) return makeFailure(makeArgsValueError('undefined', getType(a[2]) ?? 'undefined', 2))
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return firstChecked
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed by the typeCheck call just above; TS can't verify a generic Args from a runtime check
    else return makeSuccess(a as Args)
  },
  func: (main, args, { sourceTree }) => {
    const [first, second] = args
    const strFirst = Cast.toString(first)
    sourceTree.setVariable(strFirst, second === undefined ? main : second)
    return Outcome.makeSuccess(main)
  }
})
