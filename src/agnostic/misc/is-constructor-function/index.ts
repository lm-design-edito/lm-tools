/**
 * Represents a class or constructor function.
 *
 * @template T - The type of object constructed by the function.
 */
export type ConstructorFunction<T extends any = any> = new (...args: any[]) => T

/**
 * Checks whether a given value is a constructor function (i.e., a class or function with a prototype).
 *
 * @param {unknown} input - The value to check.
 * @returns {input is ConstructorFunction} `true` if the input is a constructor function, otherwise `false`.
 */
export function isConstructorFunction (input: unknown): input is ConstructorFunction {
  if (typeof input !== 'function') return false
  return 'prototype' in input
    && 'constructor' in input.prototype
}
