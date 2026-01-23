import { describe, it, expect } from 'vitest'
import { shuffle } from './index.js'

describe('shuffle', () => {
  it('shuffles and keeps the same length', () => {
    const source = [0, 1, 2, 3, 4]
    const shuffled = shuffle(source)
    expect(shuffled).toHaveLength(5)
    expect(shuffled).toContain(0)
    expect(shuffled).toContain(1)
    expect(shuffled).toContain(2)
    expect(shuffled).toContain(3)
    expect(shuffled).toContain(4)
  })
})
