import { Outcome } from '../../../../../misc/outcome'
import { Window } from '../../../../../misc/crossenv/window'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = NodeListOf<Element | Text>

export const nodelist = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'nodelist',
  defaultMode: 'isolation',
  isolationInitType: 'nodelist',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => {
    const { document } = Window.get()
    const returnedParent = document.createDocumentFragment()
    returnedParent.append(
      ...Array.from(Cast.toNodeList(main)),
      ...Array.from(Cast.toNodeList(args)))
    const returned = returnedParent.childNodes as NodeListOf<Element | Text>
    return Outcome.makeSuccess(returned)
  }
})
