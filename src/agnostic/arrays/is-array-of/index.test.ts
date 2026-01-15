import { describe, it, expect } from 'vitest'
import { isArrayOf } from './index.js'

// Custom class & typeguard for testing
class MyClass { constructor (public value: number) {} }
const isEvenNumber = (x: unknown): x is number => typeof x === 'number' && x % 2 === 0

describe('arrays/is-array-of', () => {
  it('returns true for empty array without type checkers', () => {
    expect(isArrayOf([])).toBe(true)
  })

  it('returns true for array of numbers', () => {
    expect(isArrayOf([1, 2, 3], Number)).toBe(true)
  })

  it('returns false if any element does not match primitive type', () => {
    expect(isArrayOf([1, '2', 3], Number)).toBe(false)
    expect(isArrayOf([true, false, 0], Boolean)).toBe(false)
    expect(isArrayOf(['a', 'b', 1], String)).toBe(false)
  })

  it('returns true for array of strings', () => {
    expect(isArrayOf(['a', 'b', 'c'], String)).toBe(true)
  })

  it('returns true for array of booleans', () => {
    expect(isArrayOf([true, false, true], Boolean)).toBe(true)
  })

  it('returns true for array of custom class instances', () => {
    const arr = [new MyClass(1), new MyClass(2)]
    expect(isArrayOf(arr, MyClass)).toBe(true)
  })

  it('returns false if any element is not instance of custom class', () => {
    const arr = [new MyClass(1), { value: 2 }]
    expect(isArrayOf(arr, MyClass)).toBe(false)
  })

  it('supports multiple type checkers (union)', () => {
    const arr = [1, 'a', 2, 'b']
    expect(isArrayOf(arr, [Number, String])).toBe(true)
    expect(isArrayOf([1, true], [Number, String])).toBe(false)
  })

  it('supports custom type guard functions', () => {
    const arr = [2, 4, 6]
    expect(isArrayOf(arr, isEvenNumber)).toBe(true)
    expect(isArrayOf([2, 3, 4], isEvenNumber)).toBe(false)
  })

  it('returns false for non-array input', () => {
    expect(isArrayOf(123, Number)).toBe(false)
    expect(isArrayOf({}, Number)).toBe(false)
    expect(isArrayOf(null, Number)).toBe(false)
    expect(isArrayOf(undefined, Number)).toBe(false)
  })

  it('returns true for array without type checkers', () => {
    expect(isArrayOf([1, 'a', true])).toBe(true)
  })
})
