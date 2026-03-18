import * as Outcome from '../../../misc/outcome/index.js'
import { Method } from '../method/index.js'
import { Transformer } from '../transformer/index.js'
import { type Types } from '../types/index.js'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SmartTags {
  export function makeSmartTag <
    Main extends Types.Tree.RestingValue | undefined = Types.Tree.RestingValue | undefined,
    Args extends Types.Tree.RestingArrayValue = Types.Tree.RestingArrayValue,
    Output extends Types.Tree.RestingValue = Types.Tree.RestingValue
  > (descriptor: Types.SmartTags.Descriptor<Main, Args, Output>): [string, Types.SmartTags.SmartTag<Main, Args, Output>] {
    return [descriptor.name, {
      defaultMode: descriptor.defaultMode,
      isolationInitType: descriptor.isolationInitType,
      generator: (innerValue, mode, sourceTree) => {
        const transformer = new Transformer<Main, Args, Output>(
          descriptor.name,
          mode,
          innerValue, {
            mainValue: descriptor.mainValueCheck,
            argsValue: descriptor.argsValueCheck
          },
          descriptor.func,
          sourceTree
        )
        const method = new Method(transformer)
        return { transformer, method }
      }
    }]
  }

  type NotUndefined<T> = Exclude<T, undefined>

  const isNotUndefined = <T>(value: T): value is NotUndefined<T> => value !== undefined

  export const expectNotUndef = <V>(value: V): Outcome.Either<NotUndefined<V>, {
    expected: string
    found: string
  }> => {
    if (isNotUndefined(value)) return Outcome.makeSuccess(value)
    return Outcome.makeFailure({
      expected: 'value',
      found: 'undefined'
    })
  }
}
