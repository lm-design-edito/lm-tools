import { describe, it, expect } from 'vitest'
import { hexChars, randomHexChar } from './index.js'

describe('hexChars', () => {
  it('contains 16 hexadecimal characters', () => {
    expect(hexChars.length).toBe(16)
    expect(hexChars[0]).toBe('0')
    expect(hexChars[15]).toBe('f')
  })
})

describe('randomHexChar', () => {
  it('returns a single hexadecimal character from hexChars', () => {
    const char = randomHexChar()
    expect(char.length).toBe(1)
    expect(hexChars.includes(char)).toBe(true)
  })

  it('always returns characters from the allowed set over multiple calls', () => {
    const results = Array.from({ length: 32 }, () => randomHexChar())
    expect(results.every(c => hexChars.includes(c))).toBe(true)
  })
})

