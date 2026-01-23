import { describe, it, expect } from 'vitest'
import {
  DEFAULT_K_FACTOR,
  DEFAULT_SCALE,
  getWinProbability,
  updateRating
} from './index.js'

describe('getWinProbability', () => {
  it('returns 0.5 for equal ratings', () => {
    expect(getWinProbability(1500, 1500)).toBeCloseTo(0.5)
  })

  it('returns higher than 0.5 when first player is stronger', () => {
    expect(getWinProbability(1600, 1400)).toBeGreaterThan(0.5)
  })

  it('returns lower than 0.5 when first player is weaker', () => {
    expect(getWinProbability(1400, 1600)).toBeLessThan(0.5)
  })

  it('respects a custom scale', () => {
    const customScale = 200
    const p1 = getWinProbability(1600, 1400, customScale)
    const p2 = getWinProbability(1600, 1400, DEFAULT_SCALE)
    expect(p1).toBeGreaterThan(p2) // smaller scale → bigger difference
  })
})

describe('updateRating', () => {
  it('does not change rating if actual equals expected', () => {
    const current = 1500
    const expected = 0.5
    const actual = 0.5
    const newRating = updateRating(expected, actual, current)
    expect(newRating).toBeCloseTo(current)
  })

  it('increases rating if actual > expected', () => {
    const current = 1500
    const expected = 0.3
    const actual = 1
    const newRating = updateRating(expected, actual, current)
    expect(newRating).toBeGreaterThan(current)
  })

  it('decreases rating if actual < expected', () => {
    const current = 1500
    const expected = 0.7
    const actual = 0
    const newRating = updateRating(expected, actual, current)
    expect(newRating).toBeLessThan(current)
  })

  it('accepts fractional actualOutcome (for margin of victory)', () => {
    const current = 1500
    const expected = 0.4
    const actual = 0.8
    const newRating = updateRating(expected, actual, current)
    expect(newRating).toBeGreaterThan(current)
    expect(newRating).toBeLessThan(current + DEFAULT_K_FACTOR) // should not exceed max K
  })

  it('respects custom K-factor', () => {
    const current = 1500
    const expected = 0.5
    const actual = 1
    const customK = 50
    const newRatingDefault = updateRating(expected, actual, current)
    const newRatingCustom = updateRating(expected, actual, current, customK)
    expect(newRatingCustom - current).toBeGreaterThan(newRatingDefault - current)
  })
})

describe('CONSTANTS', () => {
  it('DEFAULT_K_FACTOR is 32', () => {
    expect(DEFAULT_K_FACTOR).toBe(32)
  })

  it('DEFAULT_SCALE is 400', () => {
    expect(DEFAULT_SCALE).toBe(400)
  })
})
