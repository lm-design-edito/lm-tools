import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest'
import { debounce } from './index.js'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('debounce', () => {
  it('runs once activity has stopped for the delay, with the latest arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced(1)
    debounced(2)
    debounced(3)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(3)
  })

  it('resets the wait on every call, so a steady stream never runs', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced(1)
    vi.advanceTimersByTime(60)
    debounced(2)
    vi.advanceTimersByTime(60)
    debounced(3)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(3)
  })

  it('runs again on the next burst once a quiet period has passed', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced(1)
    vi.advanceTimersByTime(100)
    debounced(2)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(2)
  })

  describe('leading', () => {
    it('also runs on the first call of a burst', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100, { leading: true })
      debounced(1)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(1)
    })

    it('does not double-run for a single isolated call', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100, { leading: true })
      debounced(1)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('still runs the trailing edge for a call made after the leading one', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100, { leading: true })
      debounced(1)
      debounced(2)
      expect(fn).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith(2)
    })
  })

  describe('trailing: false', () => {
    it('only ever runs on the leading edge', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100, { leading: true, trailing: false })
      debounced(1)
      debounced(2)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(1)
    })
  })

  describe('cancel', () => {
    it('drops a pending call', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced(1)
      debounced.cancel()
      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('flush', () => {
    it('runs a pending call immediately', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced(1)
      debounced.flush()
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(1)
    })
  })

  describe('setDelay', () => {
    it('changes the delay used by scheduling decisions made after the call', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced.setDelay(500)
      debounced(1)
      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
      vi.advanceTimersByTime(400)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
