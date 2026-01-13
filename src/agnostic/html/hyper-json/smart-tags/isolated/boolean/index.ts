import * as Outcome from '../../../../../misc/outcome/index.js'
import { Utils } from '../../../utils/index.js'
import { Cast } from '../../../cast/index.js'
import { SmartTags } from '../../index.js'

type Main = null | boolean | number | string | Text
type Args = Array<null | boolean | number | string | Text>
type Output = boolean

export const boolean = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'boolean',
  defaultMode: 'isolation',
  isolationInitType: 'boolean',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'null', 'boolean', 'number', 'string', 'text'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'null', 'boolean', 'number', 'string', 'text'),
  func: (main, args) => Outcome.makeSuccess([main, ...args].every(item => Cast.toBoolean(item)))
})
