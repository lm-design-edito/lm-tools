import { describe, it, expect } from 'vitest'
import { splitFirst } from './index.js'

describe('splitFirst', () => {
  it('splits at the first occurrence and keeps the rest whole', () => {
    expect(splitFirst('jump-to:00:30', ':')).toEqual(['jump-to', '00:30'])
  })

  it('returns `undefined` for the tail when the separator is absent', () => {
    expect(splitFirst('play', ':')).toEqual(['play', undefined])
  })

  it('returns an empty tail when the separator ends the string', () => {
    expect(splitFirst('play:', ':')).toEqual(['play', ''])
  })

  it('returns an empty head when the separator opens the string', () => {
    expect(splitFirst(':play', ':')).toEqual(['', 'play'])
  })

  it('takes a separator of several characters', () => {
    expect(splitFirst('a -> b -> c', ' -> ')).toEqual(['a', 'b -> c'])
  })

  it('splits an empty string into an empty head and no tail', () => {
    expect(splitFirst('', ':')).toEqual(['', undefined])
  })
})
