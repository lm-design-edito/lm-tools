import { describe, it, expect } from 'vitest'
import { sortKeys } from './index.js'

describe('sortKeys', () => {
  it('returns a new object with keys sorted alphabetically by default', () => {
    const inp = { b: 2, a: 1, c: 3 }
    const out = sortKeys(inp)
    expect(Object.keys(out)).toEqual(['a', 'b', 'c'])
    expect(out).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('preserves the value types for each key', () => {
    const inp = { b: 'str', a: 42 }
    const out = sortKeys(inp, (a, b) => a.localeCompare(b))
    expect(out.a).toBe(42)
    expect(out.b).toBe('str')
  })

  it('does not modify the original object', () => {
    const inp = { b: 2, a: 1 }
    const copy = { ...inp }
    sortKeys(inp, (a, b) => a.localeCompare(b))
    expect(inp).toEqual(copy)
  })

  it('works with custom sorter', () => {
    const inp = { a: 1, b: 2, c: 3 }
    const out = sortKeys(inp, (a, b) => b.localeCompare(a)) // reverse
    expect(Object.keys(out)).toEqual(['c', 'b', 'a'])
  })

  it('works with single-key objects', () => {
    const inp = { only: 1 }
    const out = sortKeys(inp, (a, b) => a.localeCompare(b))
    expect(out).toEqual({ only: 1 })
  })

  it('works with empty objects', () => {
    const inp: Record<string, unknown> = {}
    const out = sortKeys(inp, (a, b) => a.localeCompare(b))
    expect(out).toEqual({})
  })
})
