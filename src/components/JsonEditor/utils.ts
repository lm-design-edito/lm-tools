import { clss } from '../../agnostic/css/clss/index.js'
import { isNonNullObject } from '../../agnostic/objects/is-object/index.js'
import { jsonEditor as publicClassName } from '../public-classnames.js'
import type {
  JsonValue,
  ValueType
} from './types.js'
import cssModule from './styles.module.css'

/**
 * Shared by every editor in the tree — they all emit class names under the same
 * public prefix, so a single instance is what keeps them consistent.
 */
export const c = clss(publicClassName, { cssModule })

/** Which {@link ValueType} a value belongs to. */
export function getValueType (value: JsonValue): ValueType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (isNonNullObject(value)) return 'record'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  return 'boolean'
}
