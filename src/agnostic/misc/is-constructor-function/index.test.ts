import { describe, it, expect } from 'vitest'
import { isConstructorFunction } from './index.js'

describe('isConstructorFunction', () => {
  it('returns true for class declarations', () => {
    class MyClass {}
    expect(isConstructorFunction(MyClass)).toBe(true)
  })

  it('returns true for class expressions', () => {
    const MyClass = class {}
    expect(isConstructorFunction(MyClass)).toBe(true)
  })

  it('returns true for regular functions', () => {
    function regularFunction () {}
    expect(isConstructorFunction(regularFunction)).toBe(true)
  })

  it('returns false for arrow functions', () => {
    const arrowFunction = () => {}
    expect(isConstructorFunction(arrowFunction)).toBe(false)
  })

  it('returns false for non-functions', () => {
    expect(isConstructorFunction({})).toBe(false)
    expect(isConstructorFunction(null)).toBe(false)
    expect(isConstructorFunction(42)).toBe(false)
    expect(isConstructorFunction('string')).toBe(false)
    expect(isConstructorFunction(new Date())).toBe(false)
  })

  it('returns true for built-in constructors', () => {
    expect(isConstructorFunction(Array)).toBe(true)
    expect(isConstructorFunction(Object)).toBe(true)
    expect(isConstructorFunction(Date)).toBe(true)
  })
})
