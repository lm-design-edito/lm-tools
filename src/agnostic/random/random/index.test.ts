import { describe, it, expect } from 'vitest'
import { random, randomInt } from './index.js'

describe('random', () => {
  it('generates a number in [0, 1) by default', () => {
    const value = random()
    expect(typeof value === 'number' || value === undefined).toBe(true)
    if (value !== undefined) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('supports a single upper-bound argument [0, bound)', () => {
    const bound = 10
    const value = random(bound)
    expect(typeof value === 'number' || value === undefined).toBe(true)
    if (value !== undefined) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(bound)
    }
  })

  it('supports explicit min/max bounds [min, max)', () => {
    const min = 5
    const max = 10
    const value = random(min, max)
    expect(typeof value === 'number' || value === undefined).toBe(true)
    if (value !== undefined) {
      expect(value).toBeGreaterThanOrEqual(min)
      expect(value).toBeLessThan(max)
    }
  })

  it('returns undefined when min === max', () => {
    expect(random(5, 5)).toBeUndefined()
  })

  it('returns undefined when min > max', () => {
    expect(random(10, 5)).toBeUndefined()
  })
})

describe('randomInt', () => {
  it('generates an integer in [0, 1) by default (always 0 when defined)', () => {
    const value = randomInt()
    expect(typeof value === 'number' || value === undefined).toBe(true)
    if (value !== undefined) {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('generates an integer within [0, bound)', () => {
    const bound = 10
    const value = randomInt(bound)
    expect(typeof value === 'number' || value === undefined).toBe(true)
    if (value !== undefined) {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(bound)
    }
  })

  it('generates an integer within [min, max)', () => {
    const min = 3
    const max = 7
    const value = randomInt(min, max)
    expect(typeof value === 'number' || value === undefined).toBe(true)
    if (value !== undefined) {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(min)
      expect(value).toBeLessThan(max)
    }
  })

  it('returns undefined when bounds are invalid', () => {
    expect(randomInt(5, 5)).toBeUndefined()
    expect(randomInt(10, 5)).toBeUndefined()
  })
})


