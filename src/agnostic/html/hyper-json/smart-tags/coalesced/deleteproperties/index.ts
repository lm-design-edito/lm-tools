import * as Outcome from '../../../../../misc/outcome/index.js'
import { isRecord } from '../../../../../objects/is-record/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { type Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingRecordValue
type Args = Array<string | Text>
type Output = Types.Tree.RestingRecordValue

export const deleteproperties = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'deleteproperties',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    let returned = Utils.clone(main)
    for (const arg of args) {
      const strArg = Cast.toString(arg)
      try {
        returned = deepDeleteProperty(returned, strArg)
      } catch (err) {
        return makeFailure(makeTransformationError(`Cannot access ${strArg} from input record`))
      }
    }
    return makeSuccess(returned)
  }
})

function deepDeleteProperty (record: Types.Tree.RestingRecordValue, pathString: string): Types.Tree.RestingRecordValue {
  const cloned = Utils.clone(record)
  const pathChunks = pathString.split('.')
  let currentRecord = cloned
  pathChunks.forEach((chunk, pos) => {
    const isLast = pos === pathChunks.length - 1
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (isLast) delete currentRecord[chunk]
    else {
      const found = currentRecord[chunk]
      if (isRecord(found)) {
        currentRecord = found
      } else {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'Not a record'
      }
    }
  })
  return cloned
}
