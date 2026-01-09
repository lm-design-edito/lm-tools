import {
  ConstructorFunction,
  isConstructorFunction
} from '../../misc/is-constructor-function/index.js'

/** Type guard function that checks if input is of type T. */
type TypeCheckerFunction<T extends any> = (input: unknown) => input is T
/** Type checker that can be either a constructor function or a type guard function. */
type TypeChecker<T extends any> = ConstructorFunction<T> | TypeCheckerFunction<T>

/**
 * Type guard to check if an input is an array and optionally if all elements match a type.
 *
 * If no type checkers are provided, only checks if the input is an array.
 * Supports constructor functions (e.g., `Number`, `String`, `Boolean`, custom classes)
 * and custom type guard functions.
 *
 * @param input - The value to check.
 * @param [_types] - Type checker(s) to validate array elements against.
 * @returns `true` if input is an array and all elements match the type(s), `false` otherwise.
 */
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
