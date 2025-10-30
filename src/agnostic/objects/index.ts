import { deepGetProperty as deepGetPropertyFunc } from './deep-get-property/index.js'
import { Enums as EnumsNamespace } from './enums/index.js'
import { flattenGetters as flattenGettersFunc } from './flatten-getters/index.js'
import {
  isObject as isObjectFunc,
  isNonNullObject as isNonNullObjectFunc
} from './is-object/index.js'
import { isRecord as isRecordFunc } from './is-record/index.js'
import { recordFormat as recordFormatFunc } from './record-format/index.js'
import { recordMap as recordMapFunc } from './record-map/index.js'
import { Validation as ValidationNamespace } from './validation/index.js'

export namespace Objects {
  // Deep get property
  export const deepGetProperty = deepGetPropertyFunc
  // Enums
  export import Enums = EnumsNamespace
  // Flatten getters
  export const flattenGetters = flattenGettersFunc
  // Is object
  export const isObject = isObjectFunc
  export const isNonNullObject = isNonNullObjectFunc
  // Is record
  export const isRecord = isRecordFunc
  // Record format
  export const recordFormat = recordFormatFunc
  // Record map
  export const recordMap = recordMapFunc
  // Validation
  export import Validation = ValidationNamespace
}
