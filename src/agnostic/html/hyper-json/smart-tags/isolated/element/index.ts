import { Outcome } from '../../../../../misc/outcome/index.js'
import { Window } from '../../../../../misc/crossenv/window/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = string | Text
type Args = Array<null | boolean | number | string | Text | Element | NodeListOf<Element | Text>>
type Output = Element

export const element = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'element',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'null', 'boolean', 'number', 'string', 'text', 'element', 'nodelist'),
  func: (main, args) => {
    const tagName = Cast.toString(main).trim().toLowerCase()
    const { document, NodeList } = Window.get()
    const elt = document.createElement(tagName)
    for (const argVal of args) {
      if (argVal instanceof NodeList) elt.append(...Array.from(argVal))
      else if (argVal instanceof Element) elt.append(argVal)
      else elt.append(Cast.toText(argVal))
    }
    return Outcome.makeSuccess(elt)
  }
})
