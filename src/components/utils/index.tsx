import {
  useEffect,
  useRef
} from 'react'

export function mergeClassNames (...names: Array<string | null | undefined | Array<string | null | undefined>>): string {
  return names.map(name => {
    if (typeof name !== 'string' && !Array.isArray(name)) return false
    if (Array.isArray(name)) return mergeClassNames(...name)
    if (name.trim() === '') return false
    return name.trim()
  }).filter((name): name is string => typeof name === 'string')
    .join(' ')
}

/**
 * Calls `onChange` whenever `value` changes, and only then — never on mount.
 *
 * This is how a component reports one of its state items to its consumer:
 * a bare `useEffect` on the value would also fire on the first render, telling
 * the consumer something changed when nothing did.
 *
 * @template T - Type of the watched value.
 * @param value - The value to watch.
 * @param onChange - Called with the new value, once the change has happened.
 * @param isEqual - Decides whether the value actually changed. Defaults to
 * `Object.is`, which covers booleans, numbers and strings. Pass a custom
 * comparison for values rebuilt on every render, such as an array or an object
 * derived from state, whose identity always differs.
 *
 * @remarks
 * `onChange` is deliberately left out of the effect's dependencies. A consumer
 * passing an inline arrow creates a new function on every render, which would
 * re-run the effect each time and defeat the guard. The handler is read when the
 * effect fires, so it is never a stale one.
 */
export function useChangeDispatch <T> (
  value: T,
  onChange?: (value: T) => void,
  isEqual: (a: T, b: T) => boolean = Object.is
): void {
  const previousRef = useRef(value)
  useEffect(() => {
    if (isEqual(previousRef.current, value)) return
    previousRef.current = value
    onChange?.(value)
  }, [value])
}

/**
 * The three forms a `<source>` list is written in, reduced to the one a render uses.
 *
 * A bare string is a single source, an array of strings is several, an array of records
 * is taken as given. **The array is read as homogeneous** — the first element decides for
 * all of them —, which is what someone writing one by hand means anyway, and the only
 * reading a static hyper-json array could support.
 *
 * `stringKey` is the whole reason this is shared rather than written twice. The parsing
 * is identical for `Video` and `Image`, but **the shorthand does not name the same
 * attribute**: a `<source>` inside a `<video>` carries `src`, one inside a `<picture>`
 * carries `srcSet`. The two record shapes stay apart for the same reason — the picture
 * source also takes `media` and `sizes`, which a video source has no use for, and neither
 * element accepts the other's key. One element, one shape; only the reading is common.
 *
 * @template T - The record shape the caller's element accepts.
 * @param given - What the consumer wrote.
 * @param stringKey - Where a bare string goes.
 * @returns The list as records, empty when there is nothing to render.
 */
export function parseSourceList <T extends Record<string, unknown>> (
  given: string | string[] | T[] | undefined,
  stringKey: keyof T & string
): T[] {
  const fromString = (value: string): T => {
    const single: Record<string, string> = { [stringKey]: value }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a one-key record is the narrowest `T` a bare string can describe; every other field is optional by contract
    return single as T
  }
  if (given === undefined) return []
  if (typeof given === 'string') return [fromString(given)]
  if (!Array.isArray(given)) return []
  if (given.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element sampled just above; array is read as homogeneous
  if (typeof given[0] === 'string') return (given as string[]).map(fromString)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element was checked not to be a string just above; array is read as homogeneous
  return given as T[]
}
