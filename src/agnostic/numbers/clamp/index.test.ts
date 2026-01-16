import { describe, it, expect } from 'vitest'
import { clamp } from './index.js'

describe('clamp', () => {
  it('returns number when within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(5, 10, 0)).toBe(5)
  })

  it('clamps to minimum when below lower bound', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(-5, 10, 0)).toBe(0)
  })

  it('clamps to maximum when above upper bound', () => {
    expect(clamp(15, 0, 10)).toBe(10)
    expect(clamp(15, 10, 0)).toBe(10)
  })

  it('handles bounds in any order', () => {
    expect(clamp(5, 10, 0)).toBe(5)
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('handles equal bounds', () => {
    expect(clamp(5, 10, 10)).toBe(10)
    expect(clamp(5, 0, 0)).toBe(0)
  })
})
