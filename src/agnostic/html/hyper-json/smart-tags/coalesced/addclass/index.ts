import { Outcome } from '../../../../../misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Element
type Args = Array<string | Text>
type Output = Element

export const addclass = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'addclass',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'element'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    main.classList.add(...args.map(arg => Cast.toString(arg)))
    return Outcome.makeSuccess(main)
  }
})
