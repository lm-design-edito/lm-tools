import { describe, it, expect } from 'vitest'
import { isInEnum } from './index.js'

describe('isInEnum', () => {
  it('returns true for valid string enum values', () => {
    enum StringEnum {
      A = 'a',
      B = 'b',
      C = 'c'
    }
    expect(isInEnum(StringEnum, 'a')).toBe(true)
    expect(isInEnum(StringEnum, 'b')).toBe(true)
    expect(isInEnum(StringEnum, 'c')).toBe(true)
  })

  it('returns false for invalid string enum values', () => {
    enum StringEnum {
      A = 'a',
      B = 'b'
    }
    expect(isInEnum(StringEnum, 'c')).toBe(false)
    expect(isInEnum(StringEnum, 'invalid')).toBe(false)
  })

  it('returns true for valid numeric enum values', () => {
    enum NumericEnum {
      A = 0,
      B = 1,
      C = 2
    }
    expect(isInEnum(NumericEnum, 0)).toBe(true)
    expect(isInEnum(NumericEnum, 1)).toBe(true)
    expect(isInEnum(NumericEnum, 2)).toBe(true)
  })

  it('returns false for invalid numeric enum values', () => {
    enum NumericEnum {
      A = 0,
      B = 1
    }
    expect(isInEnum(NumericEnum, 2)).toBe(false)
    expect(isInEnum(NumericEnum, 99)).toBe(false)
  })

  it('ignores reverse mappings in numeric enums', () => {
    enum NumericEnum {
      A = 0,
      B = 1
    }
    // Numeric enums have reverse mappings, but we should only check forward values
    expect(isInEnum(NumericEnum, 'A')).toBe(false) // 'A' is a key, not a value
    expect(isInEnum(NumericEnum, 0)).toBe(true) // 0 is a value
    expect(isInEnum(NumericEnum, 1)).toBe(true) // 1 is a value
  })

  it('handles mixed string and number values in enum', () => {
    enum MixedEnum {
      A = 'a',
      B = 1,
      C = 'c'
    }
    expect(isInEnum(MixedEnum, 'a')).toBe(true)
    expect(isInEnum(MixedEnum, 1)).toBe(true)
    expect(isInEnum(MixedEnum, 'c')).toBe(true)
    expect(isInEnum(MixedEnum, 'b')).toBe(false)
    expect(isInEnum(MixedEnum, 0)).toBe(false)
  })

  it('handles enum with single value', () => {
    enum SingleEnum {
      A = 'a'
    }
    expect(isInEnum(SingleEnum, 'a')).toBe(true)
    expect(isInEnum(SingleEnum, 'b')).toBe(false)
  })

  it('handles empty enum', () => {
    enum EmptyEnum {}
    expect(isInEnum(EmptyEnum, 'anything')).toBe(false)
    expect(isInEnum(EmptyEnum, 0)).toBe(false)
  })

  it('handles enum with computed values', () => {
    enum ComputedEnum {
      A = 'a',
      B = 'b'
    }
    expect(isInEnum(ComputedEnum, 'a')).toBe(true)
    expect(isInEnum(ComputedEnum, 'b')).toBe(true)
  })

  it('distinguishes between string and number types', () => {
    enum StringEnum {
      A = '1'
    }
    expect(isInEnum(StringEnum, '1')).toBe(true)
    expect(isInEnum(StringEnum, 1)).toBe(false) // number 1 is not string '1'
  })
})
