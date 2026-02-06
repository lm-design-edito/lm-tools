import {
  type ConstructorFunction,
  isConstructorFunction
} from '../../misc/is-constructor-function/index.js'

/** Type guard function that checks if input is of type T. */
type TypeCheckerFunction<T> = (input: unknown) => input is T
/** Type checker that can be either a constructor function or a type guard function. */
type TypeChecker<T> = ConstructorFunction<T> | TypeCheckerFunction<T>

/** Infer the type from a TypeChecker */
type TypeOfChecker<C> = C extends ConstructorFunction<infer U>
  ? U
  : C extends TypeCheckerFunction<infer U>
    ? U : never

/**
 * Type guard to check if an input is an array and optionally if all elements match a type.
 *
 * If no type checkers are provided, only checks if the input is an array.
 * Supports constructor functions (e.g., `Number`, `String`, `Boolean`, custom classes)
 * and custom type guard functions.
 */
export function isArrayOf<
  C extends TypeChecker<any> | Array<TypeChecker<any>>
> (
  input: unknown,
  _types?: C
): input is Array<TypeOfChecker<C extends any[] ? C[number] : C>> {
  if (!Array.isArray(input)) return false
  if (_types === undefined) return true

  const types = Array.isArray(_types) ? _types : [_types]

  const primitiveTypeMap = new Map<ConstructorFunction<any>, string>([
    [Number, 'number'],
    [String, 'string'],
    [Boolean, 'boolean']
  ])

  return input.every(entry =>
    types.some(typeChecker => {
      if (!isConstructorFunction(typeChecker)) return typeChecker(entry)
      const primitiveType = primitiveTypeMap.get(typeChecker)
      // eslint-disable-next-line valid-typeof
      if (primitiveType !== undefined) return typeof entry === primitiveType
      return entry instanceof typeChecker
    })
  )
}
