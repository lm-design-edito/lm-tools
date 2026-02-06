import * as Window from '../../../../../misc/crossenv/window/index.js'
import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Element | Element[] | NodeListOf<Element | Text>
type Args = [string | Text] | [string | Text, string | Text]
type Output = Element | Element[] | NodeListOf<Element | Text>

export const setattribute = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'setattribute',
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
    if (a.length > 2) return makeFailure(makeArgsValueError('undefined', getType(a[2]) ?? 'undefined', 2))
    const checked = typeCheckMany(a, 'string', 'text')
    if (checked.success) return makeSuccess(checked.payload as Args)
    return checked
  },
  func: (main, args) => {
    const argsStr = args.map(e => Cast.toString(e)) as [string, string?]
    const [name, value = ''] = argsStr
    if (main instanceof NodeList) {
      const { document } = Window.get()
      const children = Array.from(main).map(child => {
        const cloned = Utils.clone(child)
        if (cloned instanceof Element) cloned.setAttribute(name, value)
        return cloned
      })
      const frag = document.createDocumentFragment()
      frag.append(...children)
      const nodelist = frag.childNodes as NodeListOf<Element | Text>
      return Outcome.makeSuccess(nodelist)
    } else {
      const mainArr = Array.isArray(main) ? main : [main]
      const mainArrCloned = mainArr.map(e => Utils.clone(e))
      mainArrCloned.forEach(e => e.setAttribute(name, value))
      if (Array.isArray(main)) return Outcome.makeSuccess(mainArrCloned)
      const { makeMainValueError } = Utils.SmartTags
      const returned = mainArrCloned[0]
      if (returned === undefined) return Outcome.makeFailure(makeMainValueError('element', 'undefined'))
      return Outcome.makeSuccess(returned)
    }
  }
})
