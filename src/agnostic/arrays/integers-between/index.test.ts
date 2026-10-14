import { describe, it, expect } from 'vitest'
import { integersBetween } from './index.js'

describe('integersBetween', () => {
  it('includes both bounds', () => {
    expect(integersBetween(2, 5)).toEqual([2, 3, 4, 5])
  })

  it('returns the bound alone when they are equal', () => {
    expect(integersBetween(7, 7)).toEqual([7])
  })

  it('returns nothing when the upper bound is lower', () => {
    expect(integersBetween(5, 2)).toEqual([])
  })

  it('walks through zero and negative bounds', () => {
    expect(integersBetween(-2, 1)).toEqual([-2, -1, 0, 1])
  })
})
