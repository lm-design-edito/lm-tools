import { Window } from '../../../../../misc/crossenv/window/index.js'
import { Outcome } from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Element | NodeListOf<Element | Text>
type Args = Array<string | Text>
type Output = Element | NodeListOf<Element | Text>

export const addclass = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'addclass',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'element', 'nodelist'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const { Element, document } = Window.get()
    if (main instanceof Element) {
      main.classList.add(...args.map(arg => Cast.toString(arg)))
      return Outcome.makeSuccess(main)
    }
    const children = Array.from(main).map(child => {
      if (child instanceof Element) {
        child.classList.add(...args.map(arg => Cast.toString(arg)))
        return child
      }
      return child
    })
    const frag = document.createDocumentFragment()
    frag.append(...children)
    const nodelist = frag.childNodes as NodeListOf<Element | Text>
    return Outcome.makeSuccess(nodelist)
  }
})
