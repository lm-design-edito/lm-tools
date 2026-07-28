/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */

/**
 * Represents a class or constructor function.
 *
 * @template T - The type of object constructed by the function.
 */
export type ConstructorFunction<T = any> = new (...args: any[]) => T

/**
 * Checks whether a given value is a constructor function (i.e., a class or function with a prototype).
 *
 * @param input - The value to check.
 * @returns `true` if the input is a constructor function, otherwise `false`.
 */
export function isConstructorFunction (input: unknown): input is ConstructorFunction {
  return typeof input === 'function'
    && 'prototype' in input
    && typeof input.prototype === 'object'
    && 'constructor' in input.prototype
    && input.prototype.constructor === input
}
