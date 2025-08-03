import { Outcome } from '../../../../../misc/outcome'
import { Window } from '../../../../../misc/crossenv/window'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = NodeListOf<Element | Text> | Element
type Args = Array<string | Text>
type Output = NodeListOf<Element | Text>

export const select = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'select',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'nodelist', 'element'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const selectedFragment = document.createDocumentFragment()
    if (main instanceof Window.get().Element) {
      for (const arg of args) {
        const selector = Cast.toString(arg)
        const found = main.querySelectorAll(selector)
        selectedFragment.append(...Array.from(found))
      }
    } else {
      const divWrapper = Window.get().document.createElement('div')
      divWrapper.append(...Array.from(main))
      for (const arg of args) {
        const selector = Cast.toString(arg)
        const found = divWrapper.querySelectorAll(selector)
        selectedFragment.append(...Array.from(found))
      }
    }
    const selected = selectedFragment.childNodes as NodeListOf<Element | Text>
    return Outcome.makeSuccess(selected)
  }
})
