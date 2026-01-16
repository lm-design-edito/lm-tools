import { describe, it, expect } from 'vitest'
import { approximateRational, approximateRationalDumb } from './index.js'

describe('approximateRational', () => {
  it('approximates simple fractions', () => {
    const [num, den] = approximateRational(0.5)
    expect(num / den).toBeCloseTo(0.5, 10)
    expect(den).toBeLessThanOrEqual(1000)
  })

  it('approximates 0.333... as 1/3', () => {
    const [num, den] = approximateRational(1 / 3)
    expect(num).toBe(1)
    expect(den).toBe(3)
  })

  it('approximates 0.25 as 1/4', () => {
    const [num, den] = approximateRational(0.25)
    expect(num).toBe(1)
    expect(den).toBe(4)
  })

  it('approximates negative numbers', () => {
    const [num, den] = approximateRational(-0.5)
    expect(num / den).toBeCloseTo(-0.5, 10)
    expect(num).toBeLessThan(0)
  })

  it('respects maxDenominator limit', () => {
    const [num, den] = approximateRational(Math.PI, 100)
    expect(den).toBeLessThanOrEqual(100)
    expect(num / den).toBeCloseTo(Math.PI, 2)
  })

  it('uses default maxDenominator of 1000', () => {
    const [num, den] = approximateRational(Math.PI)
    expect(den).toBeLessThanOrEqual(1000)
  })

  it('handles zero', () => {
    const [num, den] = approximateRational(0)
    expect(num).toBe(0)
    expect(den).toBeGreaterThan(0)
  })

  it('handles integers', () => {
    const [num, den] = approximateRational(5)
    expect(num / den).toBe(5)
  })

  it('returns valid fraction for irrational numbers', () => {
    const [num, den] = approximateRational(Math.sqrt(2))
    expect(den).toBeGreaterThan(0)
    expect(num / den).toBeCloseTo(Math.sqrt(2), 5)
  })

  it('approximates small decimals', () => {
    const [num, den] = approximateRational(0.001)
    expect(num / den).toBeCloseTo(0.001, 5)
  })
})

describe('approximateRationalDumb', () => {
  it('approximates simple fractions', () => {
    const [num, den] = approximateRationalDumb(0.5, 100)
    expect(num / den).toBeCloseTo(0.5, 5)
  })

  it('finds exact matches when possible', () => {
    const [num, den] = approximateRationalDumb(0.5, 100)
    expect(num / den).toBe(0.5)
  })

  it('approximates 0.25', () => {
    const [num, den] = approximateRationalDumb(0.25, 100)
    expect(num / den).toBeCloseTo(0.25, 5)
  })

  it('approximates negative numbers', () => {
    const [num, den] = approximateRationalDumb(-0.5, 100)
    expect(num / den).toBeCloseTo(-0.5, 5)
    expect(num).toBeLessThan(0)
  })

  it('respects maxRounds limit', () => {
    const [num, den] = approximateRationalDumb(Math.PI, 29)
    expect(num / den).toBeCloseTo(Math.PI, 2)
  })

  it('handles zero', () => {
    const [num, den] = approximateRationalDumb(0, 100)
    expect(num).toBe(0)
    expect(den).toBeGreaterThan(0)
  })

  it('handles integers', () => {
    const [num, den] = approximateRationalDumb(5, 100)
    expect(num / den).toBe(5)
  })

  it('improves approximation with more rounds', () => {
    const [num1, den1] = approximateRationalDumb(0.333, 10)
    const [num2, den2] = approximateRationalDumb(0.333, 100)
    const diff1 = Math.abs(num1 / den1 - 0.333)
    const diff2 = Math.abs(num2 / den2 - 0.333)
    expect(diff2).toBeLessThanOrEqual(diff1)
  })
})
