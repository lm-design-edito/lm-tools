import {
  ConstructorFunction,
  isConstructorFunction
} from '../../misc/is-constructor-function/index.js'

type TypeCheckerFunction<T extends any> = (input: unknown) => input is T
type TypeChecker<T extends any> = ConstructorFunction<T> | TypeCheckerFunction<T>

export function isArrayOf<T extends unknown = unknown> (
  input: unknown,
  _types: TypeChecker<T> | TypeChecker<T>[] = []): input is T[] {
  if (!Array.isArray(input)) return false;
  const types = Array.isArray(_types) ? _types : [_types]
  if (types.length === 0) return true
  return input.every(entry => {
    return types.some(typeChecker => {
      const isConstructor = isConstructorFunction(typeChecker)
      if (!isConstructor) return typeChecker(entry)
      if (typeChecker === Number as ConstructorFunction<Number>) return typeof entry === 'number'
      if (typeChecker === String as ConstructorFunction<String>) return typeof entry === 'string'
      if (typeChecker === Boolean as ConstructorFunction<Boolean>) return typeof entry === 'boolean'
      if (isConstructor) return entry instanceof typeChecker
    })
  })
}
