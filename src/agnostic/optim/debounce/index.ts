import type { setTimeout as nodeSetTimeout } from 'node:timers'

type TimeoutHandle = ReturnType<typeof nodeSetTimeout> | number

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the constraint for "any function", same idiom lib.es5.d.ts uses for Parameters/ReturnType
type AnyFunction = (...args: any[]) => any

/**
 * @property leading - Invoke on the first call of a burst, before any wait. @default false
 * @property trailing - Invoke once activity has stopped for `delayMs`, with the latest arguments. @default true
 */
export type DebounceOptions = {
  leading?: boolean
  trailing?: boolean
}

/**
 * @property cancel - Drops a pending call without running it.
 * @property flush - Runs a pending call right away, if there is one.
 * @property setDelay - Changes the delay used by scheduling decisions made after the call.
 */
export type Debounced<T extends AnyFunction> = ((...args: Parameters<T>) => void) & {
  cancel: () => void
  flush: () => void
  setDelay: (delayMs: number) => void
}

/**
 * Wraps a function so it only runs once activity has stopped for `delayMs`.
 *
 * With `leading` on top of the default `trailing`, the first call of a burst also runs
 * immediately — but a lone call followed by silence still only runs once: the trailing
 * edge only fires for a call the leading edge hasn't already served.
 *
 * @template T - The type of the function to debounce.
 * @param fn - The function to debounce.
 * @param delayMs - How long activity has to stop before `fn` runs, in milliseconds.
 * @param [options] - See {@link DebounceOptions}.
 * @returns The debounced function, carrying `cancel`, `flush` and `setDelay`.
 */
export function debounce<T extends AnyFunction> (
  fn: T,
  delayMs: number,
  options: DebounceOptions = {}
): Debounced<T> {
  const { leading = false, trailing = true } = options
  let currentDelayMs = delayMs
  let pendingArgs: Parameters<T> | null = null
  let isPendingServedByLeading = false
  let timeoutHandle: TimeoutHandle | null = null

  function invoke (args: Parameters<T>): void {
    pendingArgs = null
    fn(...args)
  }

  function clearPending (): void {
    if (timeoutHandle === null) return
    clearTimeout(timeoutHandle)
    timeoutHandle = null
  }

  function debounced (...args: Parameters<T>): void {
    const isNewBurst = timeoutHandle === null
    clearPending()
    if (isNewBurst && leading) {
      invoke(args)
      isPendingServedByLeading = true
    } else {
      pendingArgs = args
      isPendingServedByLeading = false
    }
    timeoutHandle = setTimeout(() => {
      timeoutHandle = null
      if (trailing && !isPendingServedByLeading && pendingArgs !== null) invoke(pendingArgs)
      pendingArgs = null
    }, currentDelayMs)
  }

  debounced.cancel = (): void => {
    clearPending()
    pendingArgs = null
  }
  debounced.flush = (): void => {
    clearPending()
    if (pendingArgs !== null) invoke(pendingArgs)
  }
  debounced.setDelay = (delayMs: number): void => {
    currentDelayMs = delayMs
  }

  return debounced
}
