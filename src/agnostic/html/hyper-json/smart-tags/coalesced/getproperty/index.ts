import { isRecord } from '../../../../../objects/is-record/index.js'
import { Outcome } from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingRecordValue
type Args = [string | Text]
type Output = Types.Tree.RestingValue

export const getproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'getproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheckMany } = Utils.Tree.TypeChecks
    if (a.length === 0) return makeFailure(makeArgsValueError('string | Text', 'undefined', 0))
    if (a.length !== 1) return makeFailure(makeArgsValueError('undefined', getType(a.at(1)) ?? 'undefined', 1))
    const checked = typeCheckMany(a, 'string', 'text')
    if (!checked.success) return checked
    return makeSuccess(checked.payload as Args)
  },
  func: (main, args) => {
    const { getType } = Utils.Tree.TypeChecks
    const { makeTransformationError } = Utils.SmartTags
    const { makeFailure, makeSuccess } = Outcome
    const [propName] = args
    const strPropName = Cast.toString(propName)
    try {
      const found = deepGetProperty(main, strPropName)
      const foundType = getType(found)
      if (foundType !== 'transformer') return makeSuccess(found as Output)
      return makeFailure(makeTransformationError(`Forbidden access to key: '${strPropName}'`))
    } catch (err) {
      return makeFailure(makeTransformationError(`Impossible to access ${strPropName}`))
    }
  }
})

// [WIP] maybe it's own util in @design-edito/tools
export function deepGetProperty (record: Types.Tree.RestingRecordValue, pathString: string): Types.Tree.RestingValue {
  const pathChunks = pathString
    .split('.')
    .map(e => e.trim())
    .filter(e => e !== '')
  let currentRecord = record
  let returned: Types.Tree.RestingValue = currentRecord
  pathChunks.forEach((chunk, pos) => {
    const isLast = pos === pathChunks.length - 1
    if (isLast) {
      const val = currentRecord[chunk]
      if (val === undefined) throw 'PROP_UNDEFINED'
      returned = val
    }
    else {
      const found = currentRecord[chunk]
      if (isRecord(found)) currentRecord = found
      else throw 'NOT_A_RECORD'
    }
  })
  return returned
}
