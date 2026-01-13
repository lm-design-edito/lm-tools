type BasicFunc = (...args: any[]) => any

/**
 * Creates a memoized version of a function, caching the result for repeated calls with the same arguments.
 *
 * Only performs shallow equality checks on arguments (strict equality `===`).
 *
 * @template T - The type of the function to memoize.
 * @param {T} toMemoizeFunc - The function to memoize.
 * @returns {T} A memoized version of the input function.
 */
export function memoize<T extends BasicFunc>(toMemoizeFunc: T): T {
  let cachedArgs: Parameters<T> | undefined
  let cachedResult: { value: ReturnType<T> } | undefined

  const memoizedFunc = (...args: Parameters<T>): ReturnType<T> => {
    const argsMatch = cachedArgs !== undefined
      && args.length === cachedArgs.length
      && args.every((arg, i) => arg === cachedArgs![i])
    if (argsMatch && cachedResult !== undefined) return cachedResult.value
    const result = toMemoizeFunc(...args)
    cachedArgs = args
    cachedResult = { value: result }
    return result
  }

  return memoizedFunc as T
}
