import { describe, it, expect } from 'vitest'
import { memoize } from './index.js'

describe('memoize', () => {
  it('returns the same result for identical arguments without re-calling the wrapped function', () => {
    let callCount = 0
    const fn = (...args: number[]): number => {
      callCount += 1
      return args.reduce((sum, n) => sum + n, 0)
    }
    const mem = memoize(fn)
    const r1 = mem(1, 2, 3)
    const r2 = mem(1, 2, 3)
    expect(r1).toBe(6)
    expect(r2).toBe(6)
    expect(callCount).toBe(1)
  })

  it('recomputes when arguments change (shallow equality)', () => {
    let callCount = 0
    const fn = (obj: { v: number }): number => {
      callCount += 1
      return obj.v * 2
    }
    const mem = memoize(fn)
    const r1 = mem({ v: 2 })
    const r2 = mem({ v: 2 })
    expect(r1).toBe(4)
    expect(r2).toBe(4)
    expect(callCount).toBe(2)
  })
})
