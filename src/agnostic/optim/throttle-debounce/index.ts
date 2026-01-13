import type { NodeTimeout } from './types.js'

type BasicFunction = (...args: any[]) => any

/**
 * Returns a throttled version of the function passed as an argument
 * @param toThrottleFunc - The function that has to be throttled
 * @param delayMs - The throttle delay in ms
 */
export function throttle <T extends BasicFunction = BasicFunction>(
  toThrottleFunc: T,
  delayMs: number) {
  let currentDelayMs = delayMs
  let lastArgs: any[] = []
  let lastExecutedOn: number = 0
  let lastReturnValue: ReturnType<T> | undefined = undefined
  let nextExecutionTimeout: NodeTimeout | number | null = null
  
  /** Schedules a next call according to the delay */
  function scheduleNextCall () {
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
      lastReturnValue = returnValue
      lastExecutedOn = now
    }, msTillNextExecution) ?? null
  }

  /** The throttled function */
  function throttled (...args: any[]) {
    const now = Date.now()
    lastArgs = args
    if (now - lastExecutedOn >= delayMs) {
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
  function setDelay (delayMs: number) {
    currentDelayMs = delayMs
    if (nextExecutionTimeout !== null) scheduleNextCall()
  }

  return {
    throttled,
    setDelay
  }
}

/**
 * Returns a debounced version of the function passed as an argument
 * @param toDebounceFunc - The function that has to be debounced
 * @param delayMs - The debounce delay in ms
 */
export function debounce <T extends BasicFunction = BasicFunction>(
  toDebounceFunc: T,
  delayMs: number) {
  let currentDelayMs = delayMs
  let lastArgs: any[] = []
  let lastCalledOn: number = 0
  let lastExecutedOn: number = 0
  let lastReturnValue: ReturnType<T> | undefined = undefined
  let nextExecutionTimeout: NodeTimeout | number | null = null

  /** Schedules a next call according to the delay */
  function scheduleNextCall () {
    if (typeof nextExecutionTimeout === 'number') {
      clearTimeout(nextExecutionTimeout)
      nextExecutionTimeout = null
    }
    const now = Date.now()
    const nextExecutionTimestamp = lastCalledOn + currentDelayMs
    const msTillNextExecution = nextExecutionTimestamp - now
    nextExecutionTimeout = setTimeout(() => {
      nextExecutionTimeout = null
      const returnValue = toDebounceFunc(...lastArgs)
      lastReturnValue = returnValue
      lastExecutedOn = now
    }, msTillNextExecution) ?? null
  }
  
  /** The debounced function */
  function debounced (...args: any[]) {
    const now = Date.now()
    lastArgs = args
    if (now - lastCalledOn >= currentDelayMs) {
      lastCalledOn = now
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
  function setDelay (delayMs: number) {
    currentDelayMs = delayMs
    if (nextExecutionTimeout !== null) scheduleNextCall()
  }

  return {
    debounced,
    setDelay
  }
}
