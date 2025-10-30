import { Transformer } from '../transformer/index.js'
import { Types } from '../types/index.js'

export class Method<
  Main extends Types.Tree.RestingValue = Types.Tree.RestingValue,
  Args extends Types.Tree.RestingArrayValue = Types.Tree.RestingArrayValue,
  Output extends Types.Tree.RestingValue = Types.Tree.RestingValue
> {
  transformer: Transformer<Main, Args, Output>

  static clone <
    Main extends Types.Tree.RestingValue,
    Args extends Types.Tree.RestingArrayValue,
    Output extends Types.Tree.RestingValue
  >(method: Method<Main, Args, Output>): Method<Main, Args, Output> {
    const { transformer } = method
    return new Method(transformer)
  }

  constructor (transformer: Transformer<Main, Args, Output>) {
    this.transformer = transformer
  }
}
