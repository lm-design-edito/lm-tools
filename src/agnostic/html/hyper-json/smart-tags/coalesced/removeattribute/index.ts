import { Window } from '../../../../../misc/crossenv/window'
import { Outcome } from '../../../../../misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Element | Array<Element> | NodeListOf<Element | Text>
type Args = [string | Text]
type Output = Element | Array<Element> | NodeListOf<Element | Text>

export const removeattribute = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'removeattribute',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => {
    const { typeCheck, typeCheckMany } = Utils.Tree.TypeChecks
    if (Array.isArray(m)) return typeCheckMany(m, 'element')
    return typeCheck(m, 'element', 'nodelist')
  },
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { typeCheckMany, getType } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    if (a.length === 0) return makeFailure(makeArgsValueError('string | Text', 'undefined', 0))
    if (a.length > 1) return makeFailure(makeArgsValueError('undefined', getType(a[2]) ?? 'undefined', 1))
    const checked = typeCheckMany(a, 'string', 'text')
    if (checked.success) return makeSuccess(checked.payload as Args)
    return checked
  },
  func: (main, args) => {
    const argsStr = args.map(e => Cast.toString(e)) as [string, string?]
    const [name] = argsStr
    const { NodeList } = Window.get()
    if (main instanceof NodeList) {
      const children = Array.from(main).map(child => {
        const cloned = Utils.clone(child)
        if (cloned instanceof Element) cloned.removeAttribute(name)
        return cloned
      })
      const frag = document.createDocumentFragment()
      frag.append(...children)
      const nodelist = frag.childNodes as NodeListOf<Element | Text>
      return Outcome.makeSuccess(nodelist)
    } else {
      const mainArr = Array.isArray(main) ? main : [main]
      const mainArrCloned = mainArr.map(e => Utils.clone(e))
      mainArrCloned.forEach(e => e.removeAttribute(name))
      if (Array.isArray(main)) return Outcome.makeSuccess(mainArrCloned)
      return Outcome.makeSuccess(mainArrCloned[0] as Element)
    }
  }
})
