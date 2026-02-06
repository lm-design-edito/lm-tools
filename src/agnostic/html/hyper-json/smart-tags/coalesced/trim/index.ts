import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = string | Text
type Args = []
type Output = string | Text

export const trim = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'trim',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    return typeof main === 'string'
      ? Outcome.makeSuccess(main.trim())
      : Outcome.makeSuccess(Cast.toText((main.textContent ?? '').trim()))
  }
})
