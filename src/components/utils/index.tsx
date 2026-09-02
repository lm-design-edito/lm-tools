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

/** A value a component exposes to CSS or to the DOM. `undefined` entries are skipped. */
type ExposableValue = string | number | undefined

/**
 * Builds the CSS custom properties a component exposes on its root element,
 * namespaced under its public class name.
 *
 * A **number** is exposed twice: under its bare name as a `px` length, ready to
 * drop into a declaration, and under a `-raw` twin as the plain number, for
 * `calc()`. The raw form is not a convenience — CSS refuses to divide a length
 * by a length, so a ratio between two measurements is only reachable through it.
 * A **string** is exposed as it is, on the assumption it already carries its own
 * unit — or has none, like a ratio.
 *
 * @param prefix - Public class name the variables are namespaced under.
 * @param values - Variable names, without the `--prefix-` part.
 * @param options - Set `unitless` to `true` for a record of numbers that are not
 * lengths, such as ratios: they are exposed bare, with no `px` and no twin.
 * @returns The custom properties, keyed by their full `--prefix-name`.
 *
 * @example
 * toCssVars('lm-drawer', { 'content-width': 300 })
 * // { '--lm-drawer-content-width': '300px', '--lm-drawer-content-width-raw': '300' }
 */
export function toCssVars (
  prefix: string,
  values: Record<string, ExposableValue>,
  options?: { unitless?: boolean }
): Record<string, string> {
  const { unitless = false } = options ?? {}
  return Object.entries(values).reduce<Record<string, string>>((acc, [name, value]) => {
    if (value === undefined) return acc
    const isLength = !unitless && typeof value === 'number'
    return {
      ...acc,
      [`--${prefix}-${name}`]: isLength ? `${value}px` : `${value}`,
      ...isLength ? { [`--${prefix}-${name}-raw`]: `${value}` } : {}
    }
  }, {})
}

/**
 * Builds the `data-*` attributes a component exposes on an element.
 *
 * @param values - Attribute names, without the `data-` part.
 * @returns The attributes, keyed by their full `data-name`, ready to spread onto
 * a JSX element.
 *
 * @example
 * toDataAttributes({ 'content-width': 300, ratio: 0.42 })
 * // { 'data-content-width': '300', 'data-ratio': '0.42' }
 */
export function toDataAttributes (
  values: Record<string, ExposableValue>
): Record<string, string> {
  return Object.entries(values).reduce<Record<string, string>>((acc, [name, value]) => {
    if (value === undefined) return acc
    return { ...acc, [`data-${name}`]: `${value}` }
  }, {})
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
