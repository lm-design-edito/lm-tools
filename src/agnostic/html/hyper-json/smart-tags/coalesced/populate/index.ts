import * as Outcome from '../../../../../misc/outcome/index.js'
import { replaceAll } from '../../../../../strings/replace-all/index.js'
import * as Window from '../../../../../misc/crossenv/window/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { type Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'
import { deepGetProperty } from '../getproperty/index.js'

type Main = Types.Tree.RestingRecordValue
type FirstArg = string | Text | NodeListOf<Element | Text> | Element
type OtherArgs = [string | Text, string | Text]
type Args = [FirstArg, ...OtherArgs[]]
type Output = FirstArg

export const populate = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'populate',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const [first, ...others] = a
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { typeCheck, typeCheckMany, getType } = Utils.Tree.TypeChecks
    const firstChecked = typeCheck(first, 'string', 'text', 'nodelist', 'element')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(
      firstChecked.error.expected,
      firstChecked.error.found,
      0
    ))
    const othersChecked = typeCheckMany(others, 'array')
    if (!othersChecked.success) return makeFailure(makeArgsValueError(
      othersChecked.error.expected,
      othersChecked.error.found,
      othersChecked.error.position + 1
    ))
    for (const [argPos, arg] of Object.entries(othersChecked.payload)) {
      const argPosNum = parseInt(argPos)
      const [first, second] = arg
      const firstChecked = typeCheck(first, 'string', 'text')
      const secondChecked = typeCheck(second, 'string', 'text')
      if (!firstChecked.success || !secondChecked.success) return makeFailure(makeArgsValueError(
        '[string | Text, string | Text]',
        `[${getType(first)}, ${getType(second)}]`,
        argPosNum + 1
      ))
    }
    return makeSuccess(a as Args)
  },
  func: (main, args) => {
    const { makeSuccess, makeFailure } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    const record = main
    const [template, ...actions] = args
    let returnedStr = Cast.toString(template)
    for (const [propName, toReplace] of actions) {
      try {
        const value = deepGetProperty(record, Cast.toString(propName))
        const replaced = replaceAll(returnedStr, Cast.toString(toReplace), Cast.toString(value))
        returnedStr = replaced
      } catch (err) {
        return makeFailure(makeTransformationError({
          message: 'Something went wrong',
          subTransformerError: err
        }))
      }
    }
    const { Text, NodeList } = Window.get()
    if (typeof template === 'string') return makeSuccess(returnedStr)
    if (template instanceof Text) return makeSuccess(Cast.toText(returnedStr))
    if (template instanceof NodeList) return makeSuccess(Cast.toNodeList(returnedStr))
    return makeSuccess(Cast.toElement(returnedStr))
  }
})
