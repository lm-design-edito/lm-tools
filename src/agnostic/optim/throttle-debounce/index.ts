import type { NodeTimeout } from './types.js'

type BasicFunction = (...args: any[]) => any

type ThrottledResult<T extends BasicFunction> = {
  throttled: (...args: any[]) => {
    returnValue: ReturnType<T> | undefined
    lastExecutedOn: number
    delayMs: number
    isCached: boolean
  }
  setDelay: (delayMs: number) => void
}

/**
 * Returns a throttled version of the function passed as an argument
 * @param toThrottleFunc - The function that has to be throttled
 * @param delayMs - The throttle delay in ms
 */
export function throttle <T extends BasicFunction = BasicFunction> (
  toThrottleFunc: T,
  delayMs: number
): ThrottledResult<T> {
  let currentDelayMs = delayMs
  let lastArgs: any[] = []
  let lastExecutedOn: number = 0
  let lastReturnValue: ReturnType<T> | undefined
  let nextExecutionTimeout: NodeTimeout | number | null = null

  /** Schedules a next call according to the delay */
  function scheduleNextCall (): void {
    if (nextExecutionTimeout !== null) {
      clearTimeout(nextExecutionTimeout)
      nextExecutionTimeout = null
    }
    const now = Date.now()
    const nextExecutionTimestamp = lastExecutedOn + currentDelayMs
    const msTillNextExecution = nextExecutionTimestamp - now
    nextExecutionTimeout = setTimeout(() => {
      nextExecutionTimeout = null
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const returnValue = toThrottleFunc(...lastArgs)
      lastReturnValue = returnValue
      lastExecutedOn = now
    }, msTillNextExecution) ?? null
  }

  /** The throttled function */
  function throttled (...args: any[]): ReturnType<ThrottledResult<T>['throttled']> {
    const now = Date.now()
    lastArgs = args
    if (now - lastExecutedOn >= delayMs) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const returnValue = toThrottleFunc(...lastArgs)
      lastReturnValue = returnValue
      lastExecutedOn = now
      return {
        returnValue: lastReturnValue,
        lastExecutedOn,
        delayMs: currentDelayMs,
        isCached: false
      }
    }
    if (nextExecutionTimeout === null) scheduleNextCall()
    return {
      returnValue: lastReturnValue,
      lastExecutedOn,
      delayMs: currentDelayMs,
      isCached: true
    }
  }

  /** Changes the throttle delay */
  function setDelay (delayMs: number): void {
    currentDelayMs = delayMs
    if (nextExecutionTimeout !== null) scheduleNextCall()
  }

  return {
    throttled,
    setDelay
  }
}

type DebounceResult<T extends BasicFunction> = {
  debounced: (...args: any[]) => {
    returnValue: ReturnType<T> | undefined
    lastExecutedOn: number
    delayMs: number
    isCached: boolean
  }
  setDelay: (delayMs: number) => void
}

/**
 * Returns a debounced version of the function passed as an argument
 * @param toDebounceFunc - The function that has to be debounced
 * @param delayMs - The debounce delay in ms
 */
export function debounce <T extends BasicFunction = BasicFunction> (
  toDebounceFunc: T,
  delayMs: number
): DebounceResult<T> {
  let currentDelayMs = delayMs
  let lastArgs: any[] = []
  let lastCalledOn: number = 0
  let lastExecutedOn: number = 0
  let lastReturnValue: ReturnType<T> | undefined
  let nextExecutionTimeout: NodeTimeout | number | null = null

  /** Schedules a next call according to the delay */
  function scheduleNextCall (): void {
    if (nextExecutionTimeout !== null) {
      clearTimeout(nextExecutionTimeout)
      nextExecutionTimeout = null
    }
    const now = Date.now()
    const nextExecutionTimestamp = lastCalledOn + currentDelayMs
    const msTillNextExecution = nextExecutionTimestamp - now
    nextExecutionTimeout = setTimeout(() => {
      nextExecutionTimeout = null
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const returnValue = toDebounceFunc(...lastArgs)
      lastReturnValue = returnValue
      lastExecutedOn = now
    }, msTillNextExecution) ?? null
  }

  /** The debounced function */
  function debounced (...args: any[]): ReturnType<DebounceResult<T>['debounced']> {
    const now = Date.now()
    lastArgs = args
    if (now - lastCalledOn >= currentDelayMs) {
      lastCalledOn = now
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const returnValue = toDebounceFunc(...lastArgs)
      lastReturnValue = returnValue
      lastExecutedOn = now
      return {
        returnValue: lastReturnValue,
        lastExecutedOn,
        delayMs: currentDelayMs,
        isCached: false
      }
    }
    lastCalledOn = now
    scheduleNextCall()
    return {
      returnValue: lastReturnValue,
      lastExecutedOn,
      delayMs: currentDelayMs,
      isCached: true
    }
  }

  /** Changes the debounce delay */
  function setDelay (delayMs: number): void {
    currentDelayMs = delayMs
    if (nextExecutionTimeout !== null) scheduleNextCall()
  }

  return {
    debounced,
    setDelay
  }
}
