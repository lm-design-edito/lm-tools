import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { type Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingArrayValue | NodeListOf<Element | Text>
type Args = Array<string | Text>
type Output = string

export const join = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'join',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array', 'nodelist'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const { makeSuccess } = Outcome
    const joiner = Cast.toString(args)
    if (Array.isArray(main)) return makeSuccess(main.map(Cast.toString).join(joiner))
    return makeSuccess(Array.from(main).map(Cast.toString).join(joiner))
  }
})
