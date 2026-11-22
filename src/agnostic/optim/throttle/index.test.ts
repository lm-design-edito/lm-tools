import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest'
import { throttle } from './index.js'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('throttle', () => {
  it('runs on the first call, then coalesces calls made during the delay into one trailing call', () => {
    const fn = vi.fn((x: number) => x * 2)
    const throttled = throttle(fn, 100)
    throttled(1)
    throttled(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(2)
  })

  it('keeps trickling at the throttle rate under sustained calls', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('a')
    vi.advanceTimersByTime(100)
    throttled('b')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('never fires on the leading edge when leading is false', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100, { leading: false })
    throttled(1)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('drops calls made during the delay when trailing is false', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100, { trailing: false })
    throttled(1)
    throttled(2)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  describe('cancel', () => {
    it('drops a pending trailing call', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled(1)
      throttled(2)
      throttled.cancel()
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('flush', () => {
    it('runs a pending trailing call immediately, with the latest arguments', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled(1)
      throttled(2)
      throttled.flush()
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith(2)
    })

    it('does nothing when no call is pending', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled(1)
      throttled.flush()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('setDelay', () => {
    it('changes the delay used by scheduling decisions made after the call', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled(1)
      throttled.setDelay(500)
      throttled(2)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(400)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})
