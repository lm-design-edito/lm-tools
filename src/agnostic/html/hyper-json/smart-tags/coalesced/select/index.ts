import * as Outcome from '../../../../../misc/outcome/index.js'
import * as Window from '../../../../../misc/crossenv/window/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

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
    const { document, Element } = Window.get()
    const selectedFragment = document.createDocumentFragment()
    if (main instanceof Element) {
      for (const arg of args) {
        const selector = Cast.toString(arg)
        const found = main.querySelectorAll(selector)
        selectedFragment.append(...Array.from(found))
      }
    } else {
      const divWrapper = document.createElement('div')
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
