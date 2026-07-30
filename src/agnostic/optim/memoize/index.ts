type BasicFunc = (...args: unknown[]) => unknown

/**
 * Creates a memoized version of a function, caching the result for repeated calls with the same arguments.
 *
 * Only performs shallow equality checks on arguments (strict equality `===`).
 *
 * @template T - The type of the function to memoize.
 * @param toMemoizeFunc - The function to memoize.
 * @returns A memoized version of the input function.
 */
export function memoize<T extends BasicFunc> (toMemoizeFunc: T): T {
  let cachedArgs: Parameters<T> | undefined
  let cachedResult: { value: ReturnType<T> } | undefined
  const memoizedFunc = (...args: Parameters<T>): ReturnType<T> => {
    const argsMatch = cachedArgs !== undefined
      && args.length === cachedArgs.length
      && args.every((arg, i) => arg === cachedArgs?.[i])
    if (argsMatch && cachedResult !== undefined) return cachedResult.value
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const result = toMemoizeFunc(...args) as ReturnType<T>
    cachedArgs = args
    cachedResult = { value: result }
    return result
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- memoizedFunc has the same call signature as T by construction
  return memoizedFunc as T
}
