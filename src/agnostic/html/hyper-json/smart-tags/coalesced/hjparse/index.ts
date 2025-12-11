import { unknownToString } from '../../../../../errors/unknown-to-string/index.js'
import { Outcome } from '../../../../../misc/outcome/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'
import { parse } from '../hjstringify/index.js'

type Main = string | Text
type Args = []
type Output = Types.Tree.RestingValue

export const hjparse = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'hjparse',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    try {
      const parsed = parse(`${main}`)
      return Outcome.makeSuccess(parsed)
    } catch (err) {
      return Outcome.makeFailure({
        details: unknownToString(err)
      })
    }
  }
})
