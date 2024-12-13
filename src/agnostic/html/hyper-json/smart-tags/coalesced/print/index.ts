import { Outcome } from '~/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingValue

export const print = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'print',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => {
    const { getType } = Utils.Tree.TypeChecks
    const { makeSuccess, makeFailure } = Outcome
    const { makeMainValueError } = Utils.SmartTags
    return getType(m) === 'transformer'
      ? makeFailure(makeMainValueError('Exclude<value, transformer>', 'transformer'))
      : makeSuccess(m as Main)
  },
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args, details) => {
    // [WIP] maybe use the logger instead ?
    // Or think of a crossenv way to perform this ?
    console.group('print')
    console.log('Main:', main)
    console.log('Args:', ...args)
    console.log('Tree:', details.sourceTree)
    console.groupEnd()
    return Outcome.makeSuccess(main)
  }
})
