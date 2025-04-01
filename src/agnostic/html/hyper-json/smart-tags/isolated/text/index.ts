import { Outcome } from '../../../../../misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

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
      return Cast.toText(`${reduced}${Cast.toText(curr)}`)
    }, Cast.toText(''))
    return Outcome.makeSuccess(reduced)
  }
})
