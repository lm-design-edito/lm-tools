import { describe, it, expect } from 'vitest'
import { isValidClassName } from './index.js'

describe('isValidClassName', () => {
  it('returns true for valid class names', () => {
    expect(isValidClassName('my-class')).toBe(true)
    expect(isValidClassName('myClass')).toBe(true)
    expect(isValidClassName('_my-class')).toBe(true)
    expect(isValidClassName('my-class-123')).toBe(true)
    expect(isValidClassName('MyClass')).toBe(true)
  })

  it('returns true for class names starting with hyphen', () => {
    expect(isValidClassName('-my-class')).toBe(true)
    expect(isValidClassName('-myClass')).toBe(true)
  })

  it('returns false for class names starting with numbers', () => {
    expect(isValidClassName('123class')).toBe(false)
    expect(isValidClassName('0my-class')).toBe(false)
  })

  it('returns false for class names starting with hyphen and number', () => {
    expect(isValidClassName('-123class')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidClassName('')).toBe(false)
  })

  it('returns false for class names with invalid characters', () => {
    expect(isValidClassName('my class')).toBe(false)
    expect(isValidClassName('my.class')).toBe(false)
    expect(isValidClassName('my@class')).toBe(false)
    expect(isValidClassName('my#class')).toBe(false)
  })

  it('returns true for single letter class names', () => {
    expect(isValidClassName('a')).toBe(true)
    expect(isValidClassName('A')).toBe(true)
    expect(isValidClassName('_')).toBe(true)
  })
})
