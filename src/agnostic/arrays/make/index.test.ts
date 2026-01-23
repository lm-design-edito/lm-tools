import { describe, it, expect } from 'vitest'
import { make } from './index.js'
import { randomInt } from '../../random/random/index.js'

describe('make', () => {
  it('makes the array', () => {
    const made = make(() => randomInt(0, 42), 4)
    expect(made).toHaveLength(4)
    expect(made.every(i => typeof i === 'number')).toBe(true)
  })
})
