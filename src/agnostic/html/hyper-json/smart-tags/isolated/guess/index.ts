import { Outcome } from '../../../../../misc/outcome/index.js'
import { Window } from '../../../../../misc/crossenv/window/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { Cast } from '../../../cast/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingValue

export const guess = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'guess',
  defaultMode: 'isolation',
  isolationInitType: 'string',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => {
    const { typeCheck } = Utils.Tree.TypeChecks
    const { makeSuccess } = Outcome
    let coalesced = main
    for (const arg of args) coalesced = Utils.coalesceValues(coalesced, 0, arg)
    const { Text, Element, document } =  Window.get()
    if (typeof coalesced !== 'string' && !(coalesced instanceof Text)) return makeSuccess(coalesced)
    const strCoalesced = Cast.toString(coalesced)
    if (strCoalesced.trim().toLowerCase() === 'true') return makeSuccess(true)
    if (strCoalesced.trim().toLowerCase() === 'false') return makeSuccess(false)
    if (strCoalesced.trim().toLowerCase().match(/^\s*-?\s*(\d+(\.\d*)?|\.\d+)\s*$/)) return makeSuccess(parseFloat(strCoalesced))
    if (strCoalesced.trim().toLowerCase() === 'null') return makeSuccess(null)
    try {
      const parsed = JSON.parse(strCoalesced)
      const arrayChecked = typeCheck(parsed, 'array')
      const recordChecked = typeCheck(parsed, 'record')
      if (arrayChecked.success) return makeSuccess(arrayChecked.payload)
      if (recordChecked.success) return makeSuccess(recordChecked.payload)
    } catch (err) { /* If an error is caught, strCoalesced just does not represent an array or a record */ }
    const div = document.createElement('div')
    div.innerHTML = strCoalesced
    const divChildren = div.childNodes
    if (divChildren.length === 0) return makeSuccess(coalesced)
    const validDivChildren = Cast.toNodeList(Array.from(divChildren).filter(e => {
      if (e instanceof Element) return true
      if (e instanceof Text) return true
      return false
    }) as Array<Element | Text>)
    if (validDivChildren.length > 1) return makeSuccess(validDivChildren)
    const validDivFirstchild = validDivChildren.item(0)
    if (validDivChildren.length === 1 && validDivFirstchild instanceof Element) return makeSuccess(validDivFirstchild)
    return makeSuccess(coalesced)
  }
})
