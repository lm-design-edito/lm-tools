import { describe, it, expect } from 'vitest'
import { makeSuccess, makeFailure, make, getPayload, getError } from './index.js'

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

describe('getPayload', () => {
  it('returns the payload of a success', () => {
    expect(getPayload(makeSuccess('payload'), null)).toBe('payload')
  })

  it('returns the fallback on a failure', () => {
    expect(getPayload(makeFailure(new Error('nope')), null)).toBe(null)
  })

  it('returns a payload that is itself undefined rather than the fallback', () => {
    expect(getPayload(makeSuccess(undefined), 'fallback')).toBe(undefined)
  })
})

describe('getError', () => {
  it('returns the error of a failure', () => {
    const error = new Error('nope')
    expect(getError(makeFailure(error), null)).toBe(error)
  })

  it('returns the fallback on a success', () => {
    expect(getError(makeSuccess('payload'), null)).toBe(null)
  })

  it('returns an error that is itself undefined rather than the fallback', () => {
    expect(getError(makeFailure(undefined), 'fallback')).toBe(undefined)
  })
})
