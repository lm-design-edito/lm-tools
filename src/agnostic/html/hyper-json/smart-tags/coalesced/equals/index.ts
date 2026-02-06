import * as Window from '../../../../../misc/crossenv/window/index.js'
import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { type Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = [Types.Tree.RestingValue, ...Types.Tree.RestingArrayValue]
type Output = boolean

export const equals = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'equals',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => {
    const [first, ...others] = a
    if (first === undefined) return Outcome.makeFailure(Utils.SmartTags.makeArgsValueError(
      'value',
      'undefined',
      0
    ))
    const returned = [first, ...others] as Args
    return Outcome.makeSuccess(returned)
  },
  func: (main, args) => {
    const { Text } = Window.get()
    const normalizedMain = main instanceof Text ? Cast.toString(main) : main
    const normalizedArgs = args.map(a => a instanceof Text ? Cast.toString(a) : a)
    return Outcome.makeSuccess(normalizedArgs.every(arg => arg === normalizedMain))
  }
})
