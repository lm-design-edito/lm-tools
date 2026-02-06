import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'
import { type Types } from '../../../types/index.js'
import { Method } from '../../../method/index.js'
import * as Window from '../../../../../misc/crossenv/window/index.js'

type Main = Types.Tree.RestingValue
type Arg = string | Text | NodeListOf<Element | Text> | Element
type Args = [Arg, Arg]
type Output = Types.Tree.RestingValue

export const replace = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'replace',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { getType, typeCheckMany } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    const expectedStr = 'string | Text | NodeListOf<Element | Text> | Element'
    if (a.length === 0) return makeFailure(makeArgsValueError(expectedStr, 'undefined', 0))
    if (a.length === 1) return makeFailure(makeArgsValueError(expectedStr, 'undefined', 1))
    if (a.length > 2) return makeFailure(makeArgsValueError('undefined', getType(a.at(2)) ?? 'undefined', 3))
    const checked = typeCheckMany(a, 'string', 'text', 'nodelist', 'element')
    if (!checked.success) return checked
    return makeSuccess(checked.payload as Args)
  },
  func: (main, args) => {
    const [toReplace, replacer] = args
    return Outcome.makeSuccess(
      replacerFunc(
        main,
        Cast.toString(toReplace),
        Cast.toString(replacer)
      )
    )
  }
})

export function replacerFunc (
  value: Main,
  toReplace: string,
  replacer: string
): Main {
  if (typeof value === 'number'
    || typeof value === 'boolean'
    || value === null
    || value instanceof Method
  ) return value
  if (typeof value === 'string') return value.replaceAll(toReplace, replacer)
  const { Text, Element, NodeList } = Window.get()
  if (value instanceof Text) return Cast.toText(Cast.toString(value).replaceAll(toReplace, replacer))
  if (value instanceof Element) return Cast.toElement(Cast.toString(value).replaceAll(toReplace, replacer))
  if (value instanceof NodeList) return Cast.toNodeList(Cast.toString(value).replaceAll(toReplace, replacer))
  if (Array.isArray(value)) return value.map(val => replacerFunc(val, toReplace, replacer))
  return Object
    .entries(value)
    .reduce((acc, [key, val]) => ({
      ...acc,
      [key]: replacerFunc(val, toReplace, replacer)
    }), {})
}
