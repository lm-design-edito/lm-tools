import { Cast as CastNamespace } from './cast/index.js'
import { Method as MethodClass } from './method/index.js'
import { Serialize as SerializeNamespace } from './serialize/index.js'
import { SmartTags as SmartTagsNamespace } from './smart-tags/index.js'
import { Transformer as TransformerClass } from './transformer/index.js'
import { Tree as TreeNamespace } from './tree/index.js'
import { Types as TypesNamespace } from './types/index.js'
import { Utils as UtilsNamespace } from './utils/index.js'

// [WIP] missing jsdoc in all the hyper-json stuff
// [WIP] get rid of namespaces
// [WIP] write tests

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace HyperJson {
  export import Cast = CastNamespace
  export const Method = MethodClass
  export import Serialize = SerializeNamespace
  export import SmartTags = SmartTagsNamespace
  export const Transformer = TransformerClass
  export import Tree = TreeNamespace
  export import Types = TypesNamespace
  export import Utils = UtilsNamespace
}
