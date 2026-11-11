import { describe, it, expect } from 'vitest'
import { tryCatch } from './index.js'

describe('tryCatch', () => {
  it('returns a success carrying what the function returned', () => {
    const outcome = tryCatch(() => 42)
    expect(outcome.success).toBe(true)
    if (outcome.success) expect(outcome.payload).toBe(42)
  })

  it('returns a success when the function returns undefined', () => {
    const outcome = tryCatch(() => undefined)
    expect(outcome).toMatchObject({ success: true, payload: undefined })
  })

  it('returns a failure carrying the thrown error', () => {
    const thrown = new Error('nope')
    const outcome = tryCatch(() => { throw thrown })
    expect(outcome).toMatchObject({ success: false, error: thrown })
  })

  it('returns a failure carrying a thrown value that is not an Error', () => {
    const outcome = tryCatch(() => { throw 'a string' })
    expect(outcome).toMatchObject({ success: false, error: 'a string' })
  })

  it('does not catch a rejection, since the function is run synchronously', async () => {
    const outcome = tryCatch(async () => { await Promise.resolve(); throw new Error('later') })
    expect(outcome.success).toBe(true)
    if (outcome.success) await expect(outcome.payload).rejects.toThrow('later')
  })
})
