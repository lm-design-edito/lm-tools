import { describe, it, expect } from 'vitest'
import { randomHash, randomHashPattern, randomUUID } from './index.js'
import { hexChars } from '../hex-char/index.js'

const isHexString = (value: string): boolean =>
  value.split('').every(char => hexChars.includes(char))

describe('randomHash', () => {
  it('generates a 4-character hexadecimal string by default', () => {
    const hash = randomHash()
    expect(hash.length).toBe(4)
    expect(isHexString(hash)).toBe(true)
  })

  it('generates a hexadecimal string of the requested length', () => {
    const length = 8
    const hash = randomHash(length)
    expect(hash.length).toBe(length)
    expect(isHexString(hash)).toBe(true)
  })
})

describe('randomHashPattern', () => {
  it('generates segments of the requested lengths joined by default "-"', () => {
    const pattern = [2, 3, 4]
    const hash = randomHashPattern(pattern)
    const parts = hash.split('-')
    expect(parts.length).toBe(pattern.length)
    parts.forEach((part, index) => {
      expect(part.length).toBe(pattern[index])
      expect(isHexString(part)).toBe(true)
    })
  })

  it('supports a custom joiner', () => {
    const pattern = [1, 1, 1]
    const joiner = ':'
    const hash = randomHashPattern(pattern, joiner)
    expect(hash.split(joiner).length).toBe(pattern.length)
  })
})

describe('randomUUID', () => {
  it('generates a UUID-like hexadecimal string with expected pattern', () => {
    const uuid = randomUUID()
    const parts = uuid.split('-')
    expect(parts.map(p => p.length)).toEqual([8, 4, 4, 4, 12])
    parts.forEach(part => {
      expect(isHexString(part)).toBe(true)
    })
  })
})

