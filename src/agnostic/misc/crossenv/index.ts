import { detectRuntime as detectRuntimeFunc } from './detect-runtime/index.js'
import { Types as TypesNamespace } from './types/index.js'
import { Window as WindowNamespace } from './window/index.js'

export namespace Crossenv {
  export const detectRuntime = detectRuntimeFunc
  export import Types = TypesNamespace
  export import Window = WindowNamespace
}
