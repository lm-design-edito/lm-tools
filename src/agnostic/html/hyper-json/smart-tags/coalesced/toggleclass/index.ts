import { Window } from '../../../../../misc/crossenv/window'
import { Outcome } from '../../../../../misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Element | NodeListOf<Element | Text>
type Args = Array<string | Text>
type Output = Element | NodeListOf<Element | Text>

export const toggleclass = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toggleclass',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'element', 'nodelist'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const { Element } = Window.get()
    if (main instanceof Element) {
      args.forEach(arg => main.classList.toggle(Cast.toString(arg)))
      return Outcome.makeSuccess(main)
    }
    const children = Array.from(main).map(child => {
      if (child instanceof Element) {
        args.forEach(arg => child.classList.toggle(Cast.toString(arg)))
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
