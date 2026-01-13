import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

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
