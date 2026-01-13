import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Element
type Args = [string | Text]
type Output = string | null

export const getattribute = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'getattribute',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'element'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { typeCheckMany, getType } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    if (a.length === 0) return makeFailure(makeArgsValueError('string | Text', 'undefined', 0))
    if (a.length > 1) return makeFailure(makeArgsValueError('undefined', getType(a[2]) ?? 'undefined', 1))
    const checked = typeCheckMany(a, 'string', 'text')
    if (checked.success) return makeSuccess(checked.payload as Args)
    return checked
  },
  func: (main, args) => {
    const name = Cast.toString(args[0])
    const found = main.getAttribute(name)
    return Outcome.makeSuccess(found)
  }
})
