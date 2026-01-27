import { describe, it, expect, vi } from 'vitest'
import { throttle, debounce } from './index.js'

describe('throttle', () => {
  it('calls the wrapped function immediately and then throttles subsequent calls', async () => {
    vi.useFakeTimers()
    const fn = vi.fn((x: number) => x * 2)
    const { throttled } = throttle(fn, 100)
    const first = throttled(1)
    const second = throttled(2)
    expect(first.isCached).toBe(false)
    expect(first.returnValue).toBe(2)
    expect(second.isCached).toBe(true)
    expect(fn).toHaveBeenCalledTimes(1)
    // Fast-forward past the throttle delay to trigger the scheduled call
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})

describe('debounce', () => {
  it('fires immediately on first call, then debounces subsequent calls and uses latest arguments', async () => {
    vi.useFakeTimers()
    const fn = vi.fn((x: number) => x * 3)
    const { debounced } = debounce(fn, 100)
    // First call executes immediately (leading edge)
    debounced(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(1)
    // Subsequent rapid calls within the debounce window are deferred
    debounced(2)
    debounced(3)
    expect(fn).toHaveBeenCalledTimes(1)
    // After the delay, the deferred call should run once with the latest args
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
    // After an inactivity window, a new call should again execute immediately
    vi.advanceTimersByTime(200)
    debounced(4)
    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenLastCalledWith(4)
    vi.useRealTimers()
  })
})
