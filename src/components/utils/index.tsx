import {
  useEffect,
  useRef
} from 'react'

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
