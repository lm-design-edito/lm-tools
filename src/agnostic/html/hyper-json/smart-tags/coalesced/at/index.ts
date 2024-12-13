import { Outcome } from '~/agnostic/misc/outcome'
import { Window } from '~/agnostic/misc/crossenv/window'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text | Types.Tree.RestingArrayValue | NodeListOf<Element | Text>
type Args = [number | string | Text]
type Output = Types.Tree.RestingValue

export const at = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'at',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text', 'array', 'nodelist'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheckMany } = Utils.Tree.TypeChecks
    if (a.length === 0) return makeFailure(makeArgsValueError('number | string | text', 'undefined', 0))
    if (a.length > 1) return makeFailure(makeArgsValueError('undefined', getType(a[1]) ?? 'undefined', 1))
    const checked = typeCheckMany(a, 'number', 'string', 'text')
    if (checked.success) return makeSuccess(a as Args)
    return checked
  },
  func: (main, args) => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    const pos = args[0]
    const numPos = Cast.toNumber(pos)
    let found: Types.Tree.RestingValue | undefined
    const { NodeList } = Window.get()
    if (typeof main === 'string'
      || Array.isArray(main)
      || main instanceof NodeList) { found = main[numPos] }
    else {
      const strMain = Cast.toString(main)
      found = strMain[numPos]
    }
    if (found === undefined) return makeFailure(makeTransformationError({
      message: 'Property does not exist'
      // [WIP] maybe more details here ?
    }))
    return makeSuccess(found)
  }
})
