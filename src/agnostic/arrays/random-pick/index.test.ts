import { describe, it, expect } from 'vitest'
import { randomPick, randomPickMany } from './index.js'
import { make } from '../make/index.js'

describe('arrays/random-pick', () => {
  it('correctly picks one and many', () => {
    const source = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const pickedOneTenTimes = make(() => randomPick(source), 10)
    const pickedManyTenTimes = make(() => randomPickMany(3, source), 10)
    expect(pickedOneTenTimes.every(picked => source.includes(picked)))
    expect(pickedManyTenTimes.every(picked => picked.every(p => source.includes(p))))
  })
  it('throws if asked to pick more than there are in the input', () => {
    expect(() => randomPickMany(2, [0])).toThrow()
  })
})
