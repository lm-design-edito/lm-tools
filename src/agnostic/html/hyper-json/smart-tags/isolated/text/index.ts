import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = null | boolean | number | string | Text | Element | NodeListOf<Element | Text>
type Args = Array<null | boolean | number | string | Text | Element | NodeListOf<Element | Text>>
type Output = Text

export const text = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'text',
  defaultMode: 'isolation',
  isolationInitType: 'text',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'null', 'boolean', 'number', 'string', 'text', 'element', 'nodelist'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'null', 'boolean', 'number', 'string', 'text', 'element', 'nodelist'),
  func: (main, args) => {
    const all = [main, ...args]
    const reduced = all.reduce<Text>((reduced, curr) => {
      const red = reduced.textContent ?? ''
      const cur = Cast.toText(curr).textContent ?? ''
      return Cast.toText(`${red}${cur}`)
    }, Cast.toText(''))
    return Outcome.makeSuccess(reduced)
  }
})
