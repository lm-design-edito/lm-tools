import { Outcome } from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = null | boolean | number | string | Text | Element | NodeListOf<Element | Text>
type Args = Array<null | boolean | number | string | Text | Element | NodeListOf<Element | Text>>
type Output = string

export const string = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'string',
  defaultMode: 'isolation',
  isolationInitType: 'string',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'null', 'boolean', 'number', 'string', 'text', 'element', 'nodelist'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'null', 'boolean', 'number', 'string', 'text', 'element', 'nodelist'),
  func: (main, args) => {
    const all = [main, ...args]
    const reduced = all.reduce<string>((reduced, curr) => {
      return `${reduced}${Cast.toString(curr)}`
    }, '')
    return Outcome.makeSuccess(reduced)
  }
})
