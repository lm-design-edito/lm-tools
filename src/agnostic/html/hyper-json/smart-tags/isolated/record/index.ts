import { Outcome } from '../../../../../misc/outcome/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingRecordValue
type Args = Types.Tree.RestingRecordValue[]
type Output = Types.Tree.RestingRecordValue

export const record = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'record',
  defaultMode: 'isolation',
  isolationInitType: 'record',
  mainValueCheck: i => Utils.Tree.TypeChecks.typeCheck(i, 'record'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'record'),
  func: (main, args) => Outcome.makeSuccess(args.reduce((reduced, current) => ({
    ...reduced,
    ...current
  }), main))
})
 