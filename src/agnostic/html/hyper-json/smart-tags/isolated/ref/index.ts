import * as Outcome from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import type { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = string | Text
type Args = []
type Output = Types.Tree.RestingValue

export const func: Types.Transformations.Function<Main, Args, Output> = (main, _args, { sourceTree }) => {
  const { makeFailure, makeSuccess } = Outcome
  const { makeTransformationError } = Utils.SmartTags
  const strMain = Cast.toString(main)
  const resolveFrom = strMain.startsWith('/') ? sourceTree.root : sourceTree
  const splitted = strMain.split('/')
    .filter(e => e.trim() !== '')
    .map(e => {
      const looksLikeNumber = e.match(/^\d+$/igmv)
      if (looksLikeNumber === null) return e
      const parsed = parseInt(e)
      if (Number.isNaN(parsed)) return e
      return parsed
    })
  const resolved = resolveFrom.resolve(splitted)
  if (resolved === undefined) return makeFailure(makeTransformationError(`No value was found at path: ${strMain}`))
  if (resolved === sourceTree) return makeFailure(makeTransformationError('A ref node cannot reference itself.'))
  if (resolved.parents.includes(sourceTree)) return makeFailure(makeTransformationError('A ref node cannot reference one of its parents.'))
  if (sourceTree.parents.includes(resolved)) return makeFailure(makeTransformationError('A ref node cannot reference one of its children.'))
  const evaluated = resolved.evaluate()
  const { getType } = Utils.Tree.TypeChecks
  if (getType(evaluated) === 'transformer') {
    // [WIP] implemented this without thinking of what it means to reference a transformer node
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- getType(evaluated) === 'transformer' was checked just above
    const transformer = evaluated as Types.Tree.TransformerValue
    return makeSuccess(transformer.toMethod())
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the 'transformer' case was already handled and returned above
  return makeSuccess(evaluated as Types.Tree.RestingValue)
}

export const ref = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'ref',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func
})
