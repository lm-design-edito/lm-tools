import { Outcome } from '../../../../../misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text
type Args = Array<string | Text>
type Output = Array<string | Text>

export const split = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'split',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    let strReturnedArr = [Cast.toString(main)]
    for (const arg of args) {
      strReturnedArr = strReturnedArr
        .map(e => e.split(Cast.toString(arg)))
        .flat()
    }
    if (typeof main === 'string') return Outcome.makeSuccess(strReturnedArr)
    return Outcome.makeSuccess(strReturnedArr.map(Cast.toText))
  }
})
