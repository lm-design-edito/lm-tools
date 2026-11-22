import type { setTimeout as nodeSetTimeout } from 'node:timers'

type TimeoutHandle = ReturnType<typeof nodeSetTimeout> | number

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the constraint for "any function", same idiom lib.es5.d.ts uses for Parameters/ReturnType
type AnyFunction = (...args: any[]) => any

/**
 * @property leading - Invoke on the first call of a burst, as soon as it happens. @default true
 * @property trailing - Invoke once more at the end of the delay if calls arrived during it, with the latest arguments. @default true
 */
export type ThrottleOptions = {
  leading?: boolean
  trailing?: boolean
}

/**
 * @property cancel - Drops a pending trailing call without running it.
 * @property flush - Runs a pending trailing call right away, if there is one.
 * @property setDelay - Changes the delay used by scheduling decisions made after the call.
 */
export type Throttled<T extends AnyFunction> = ((...args: Parameters<T>) => void) & {
  cancel: () => void
  flush: () => void
  setDelay: (delayMs: number) => void
}

/**
 * Wraps a function so it runs at most once every `delayMs`.
 *
 * With both `leading` and `trailing` at their default, the first call of a burst runs
 * immediately, further calls during the delay are coalesced, and one trailing call runs
 * at the end of the delay with the latest arguments — so a steady stream of calls
 * produces a steady trickle of invocations at the throttle rate, not just the first and
 * last one.
 *
 * @template T - The type of the function to throttle.
 * @param fn - The function to throttle.
 * @param delayMs - The minimum time between two invocations, in milliseconds.
 * @param [options] - See {@link ThrottleOptions}.
 * @returns The throttled function, carrying `cancel`, `flush` and `setDelay`.
 */
export function throttle<T extends AnyFunction> (
  fn: T,
  delayMs: number,
  options: ThrottleOptions = {}
): Throttled<T> {
  const { leading = true, trailing = true } = options
  let currentDelayMs = delayMs
  let lastExecutedOn: number | null = null
  let pendingArgs: Parameters<T> | null = null
  let timeoutHandle: TimeoutHandle | null = null

  function clearPending (): void {
    if (timeoutHandle === null) return
    clearTimeout(timeoutHandle)
    timeoutHandle = null
  }

  function invoke (args: Parameters<T>): void {
    lastExecutedOn = Date.now()
    pendingArgs = null
    fn(...args)
  }

  function scheduleTrailing (delay: number): void {
    timeoutHandle = setTimeout(() => {
      timeoutHandle = null
      if (pendingArgs !== null) invoke(pendingArgs)
    }, Math.max(0, delay))
  }

  function throttled (...args: Parameters<T>): void {
    const now = Date.now()
    const elapsed = lastExecutedOn === null ? currentDelayMs : now - lastExecutedOn
    if (elapsed >= currentDelayMs && leading) {
      invoke(args)
      return
    }
    if (!trailing) return
    pendingArgs = args
    if (timeoutHandle === null) {
      scheduleTrailing(elapsed >= currentDelayMs ? currentDelayMs : currentDelayMs - elapsed)
    }
  }

  throttled.cancel = (): void => {
    clearPending()
    pendingArgs = null
  }
  throttled.flush = (): void => {
    clearPending()
    if (pendingArgs !== null) invoke(pendingArgs)
  }
  throttled.setDelay = (delayMs: number): void => {
    currentDelayMs = delayMs
  }

  return throttled
}
