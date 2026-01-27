import { describe, it, expect } from 'vitest'
import { flattenGetters } from './index.js'

describe('flattenGetters', () => {
  it('returns a shallow copy of plain objects', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = flattenGetters(obj)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
    expect(result).not.toBe(obj)
  })

  it('includes getter values in the result', () => {
    const obj = {
      a: 1,
      get b () { return this.a * 2 }
    }
    const result = flattenGetters(obj)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('handles multiple getters', () => {
    const obj = {
      base: 10,
      get doubled () { return this.base * 2 },
      get tripled () { return this.base * 3 }
    }
    const result = flattenGetters(obj)
    expect(result).toEqual({ base: 10, doubled: 20, tripled: 30 })
  })

  it('evaluates getters with current context', () => {
    const obj = {
      value: 5,
      get squared () { return this.value * this.value }
    }
    obj.value = 10
    const result = flattenGetters(obj)
    expect(result).toEqual({ value: 10, squared: 100 })
  })

  it('handles objects with both regular properties and getters', () => {
    const obj = {
      regular: 'value',
      get computed () { return 'computed' },
      number: 42
    }
    const result = flattenGetters(obj)
    expect(result).toEqual({ regular: 'value', computed: 'computed', number: 42 })
  })

  it('throws on null and undefined', () => {
    expect(() => flattenGetters(null as any)).toThrow()
    expect(() => flattenGetters(undefined as any)).toThrow()
  })

  it ('handles strings and numbers', () => {
    expect(flattenGetters(42 as any)).toEqual({})
    expect(flattenGetters('abc' as any)).toEqual({ '0': 'a', '1': 'b', '2': 'c' })
  })

  it('handles objects with no properties', () => {
    expect(flattenGetters({})).toEqual({})
  })

  it('handles objects with only getters', () => {
    const obj = {
      get value () { return 42 }
    }
    const result = flattenGetters(obj)
    expect(result).toEqual({ value: 42 })
  })

  it('handles getters that return objects', () => {
    const obj = {
      get nested () { return { a: 1, b: 2 } }
    }
    const result = flattenGetters(obj)
    expect(result).toEqual({ nested: { a: 1, b: 2 } })
  })

  it('handles getters that throw errors', () => {
    const obj = {
      a: 1,
      get error () { throw new Error('test') }
    }
    expect(() => flattenGetters(obj)).toThrow('test')
  })
})
