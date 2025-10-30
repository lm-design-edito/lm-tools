import {
  Falsy as FalsyType,
  NotFalsy as NotFalsyType,
  falsyValues as falsyValuesFunc,
  isFalsy as isFalsyFunc,
  isNotFalsy as isNotFalsyFunc
} from './is-falsy/index.js'

export namespace Booleans {
  export type Falsy = FalsyType
  export type NotFalsy<T> = NotFalsyType<T>
  export const falsyValues = falsyValuesFunc
  export const isFalsy = isFalsyFunc
  export const isNotFalsy = isNotFalsyFunc
}
