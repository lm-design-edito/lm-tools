import { describe, it, expect } from 'vitest'
import { findDuplicates, findDuplicatesPositions } from './index.js'

describe('arrays/find-duplicates', () => {
  it('finds no duplicates when there are none', () => {
    const result = findDuplicates([1, 2, 3])
    expect(result).toHaveLength(0)
  })
  it('finds duplicates and stops at first when asked', () => {
    const result = findDuplicates([1, 1, 2, 2], true)
    expect(result).toHaveLength(1)
    expect(result).toContain(1)
  })
  it('finds all duplicates otherwise', () => {
    const result = findDuplicates([1, 1, 2, 2])
    expect(result).toHaveLength(2)
    expect(result).toContain(1)
    expect(result).toContain(2)
  })
})

describe('arrays/find-duplicates-positions', () => {
  it('finds no duplicates positions when there are no duplicates', () => {
    const result = findDuplicatesPositions([1, 2, 3])
    expect(result).toHaveLength(0)
  })
  it('finds all duplicates positions', () => {
    const result = findDuplicatesPositions([1, 1, 2, 2])
    expect(result).toHaveLength(2)
    expect(result).toContain(1)
    expect(result).toContain(3)
  })
})
