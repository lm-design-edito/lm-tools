import { describe, it, expect } from 'vitest'
import { makeSuccess, makeFailure, make } from './index.js'

describe('makeSuccess', () => {
  it('creates success outcome with payload', () => {
    const result = makeSuccess('test')
    expect(result.success).toBe(true)
    expect(result.payload).toBe('test')
  })

  it('creates success with object payload', () => {
    const payload = { a: 1, b: 2 }
    const result = makeSuccess(payload)
    expect(result.success).toBe(true)
    expect(result.payload).toEqual(payload)
  })
})

describe('makeFailure', () => {
  it('creates failure outcome with error', () => {
    const result = makeFailure('error message')
    expect(result.success).toBe(false)
    expect(result.error).toBe('error message')
  })

  it('creates failure with Error object', () => {
    const error = new Error('test error')
    const result = makeFailure(error)
    expect(result.success).toBe(false)
    expect(result.error).toBe(error)
  })
})

describe('make', () => {
  it('creates success when first argument is true', () => {
    const result = make(true, 'payload')
    expect(result.success).toBe(true)
    expect(result.payload).toBe('payload')
  })

  it('creates failure when first argument is false', () => {
    const result = make(false, 'error')
    expect(result.success).toBe(false)
    expect(result.error).toBe('error')
  })
})
