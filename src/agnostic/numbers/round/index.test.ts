import { describe, it, expect } from 'vitest'
import { round, ceil, floor } from './index.js'

describe('round', () => {
  it('rounds to integer by default', () => {
    expect(round(3.7)).toBe(4)
    expect(round(3.2)).toBe(3)
  })

  it('rounds to specified decimal places', () => {
    expect(round(3.14159, 2)).toBe(3.14)
    expect(round(3.14159, 3)).toBe(3.142)
  })

  it('handles zero', () => {
    expect(round(0)).toBe(0)
    expect(round(0, 2)).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(round(-3.7)).toBe(-4)
    expect(round(-3.2)).toBe(-3)
  })
})

describe('ceil', () => {
  it('rounds up to integer by default', () => {
    expect(ceil(3.1)).toBe(4)
    expect(ceil(3.9)).toBe(4)
  })

  it('rounds up to specified decimal places', () => {
    expect(ceil(3.14159, 2)).toBe(3.15)
    expect(ceil(3.14159, 3)).toBe(3.142)
  })

  it('handles zero', () => {
    expect(ceil(0)).toBe(0)
    expect(ceil(0, 2)).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(ceil(-3.1)).toBe(-3)
    expect(ceil(-3.9)).toBe(-3)
  })
})

describe('floor', () => {
  it('rounds down to integer by default', () => {
    expect(floor(3.1)).toBe(3)
    expect(floor(3.9)).toBe(3)
  })

  it('rounds down to specified decimal places', () => {
    expect(floor(3.14159, 2)).toBe(3.14)
    expect(floor(3.14159, 3)).toBe(3.141)
  })

  it('handles zero', () => {
    expect(floor(0)).toBe(0)
    expect(floor(0, 2)).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(floor(-3.1)).toBe(-4)
    expect(floor(-3.9)).toBe(-4)
  })
})
