import * as Outcome from '../../../../../misc/outcome/index.js'
import * as Window from '../../../../../misc/crossenv/window/index.js'
import { Cast } from '../../../cast/index.js'
import { type Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

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
