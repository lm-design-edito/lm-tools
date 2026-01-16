import { describe, it, expect } from 'vitest'
import { absoluteModulo } from './index.js'

describe('absoluteModulo', () => {
  it('returns non-negative result for positive numbers', () => {
    expect(absoluteModulo(10, 3)).toBe(1)
    expect(absoluteModulo(5, 2)).toBe(1)
  })

  it('returns non-negative result for negative numbers', () => {
    expect(absoluteModulo(-10, 3)).toBe(2)
    expect(absoluteModulo(-5, 2)).toBe(1)
  })

  it('handles zero', () => {
    expect(absoluteModulo(0, 5)).toBe(0)
  })

  it('handles numbers larger than modulo', () => {
    expect(absoluteModulo(15, 10)).toBe(5)
    expect(absoluteModulo(25, 10)).toBe(5)
  })

  it('handles numbers smaller than negative modulo', () => {
    expect(absoluteModulo(-15, 10)).toBe(5)
    expect(absoluteModulo(-25, 10)).toBe(5)
  })
})
