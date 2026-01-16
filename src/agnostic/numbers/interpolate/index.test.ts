import { describe, it, expect } from 'vitest'
import { interpolate, unlerp } from './index.js'

describe('interpolate', () => {
  it('returns bound1 when ratio is 0', () => {
    expect(interpolate(0, 10, 20)).toBe(10)
  })

  it('returns bound2 when ratio is 1', () => {
    expect(interpolate(1, 10, 20)).toBe(20)
  })

  it('interpolates between bounds', () => {
    expect(interpolate(0.5, 10, 20)).toBe(15)
    expect(interpolate(0.25, 0, 100)).toBe(25)
  })

  it('handles negative ratios', () => {
    expect(interpolate(-0.5, 10, 20)).toBe(5)
  })

  it('handles ratios greater than 1', () => {
    expect(interpolate(1.5, 10, 20)).toBe(25)
  })
})

describe('unlerp', () => {
  it('returns ratio of value to bound1 when bound2 is omitted', () => {
    expect(unlerp(5, 10)).toBe(0.5)
    expect(unlerp(20, 10)).toBe(2)
  })

  it('returns 0 when value equals bound1', () => {
    expect(unlerp(10, 10, 20)).toBe(0)
  })

  it('returns 1 when value equals bound2', () => {
    expect(unlerp(20, 10, 20)).toBe(1)
  })

  it('calculates ratio between bounds', () => {
    expect(unlerp(15, 10, 20)).toBe(0.5)
    expect(unlerp(12.5, 10, 20)).toBe(0.25)
  })

  it('handles values outside bounds', () => {
    expect(unlerp(25, 10, 20)).toBe(1.5)
    expect(unlerp(5, 10, 20)).toBe(-0.5)
  })
})
