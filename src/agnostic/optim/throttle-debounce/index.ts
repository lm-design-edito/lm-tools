/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */

import type { NodeTimeout } from './types.js'

type BasicFunction = (...args: any[]) => any

type ThrottledResult<T extends BasicFunction> = {
  throttled: (...args: unknown[]) => {
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
  let lastArgs: unknown[] = []
  let lastExecutedOn = 0
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
      const returnValue = toThrottleFunc(...lastArgs)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      lastReturnValue = returnValue as ReturnType<T> | undefined
      lastExecutedOn = now
    }, msTillNextExecution)
  }

  /** The throttled function */
  function throttled (...args: unknown[]): ReturnType<ThrottledResult<T>['throttled']> {
    const now = Date.now()
    lastArgs = args
    if (now - lastExecutedOn >= delayMs) {
      const returnValue = toThrottleFunc(...lastArgs)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      lastReturnValue = returnValue as ReturnType<T> | undefined
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
  debounced: (...args: unknown[]) => {
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
  let lastArgs: unknown[] = []
  let lastCalledOn = 0
  let lastExecutedOn = 0
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
      const returnValue = toDebounceFunc(...lastArgs)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      lastReturnValue = returnValue as ReturnType<T> | undefined
      lastExecutedOn = now
    }, msTillNextExecution)
  }

  /** The debounced function */
  function debounced (...args: unknown[]): ReturnType<DebounceResult<T>['debounced']> {
    const now = Date.now()
    lastArgs = args
    if (now - lastCalledOn >= currentDelayMs) {
      lastCalledOn = now
      const returnValue = toDebounceFunc(...lastArgs)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      lastReturnValue = returnValue as ReturnType<T> | undefined
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
