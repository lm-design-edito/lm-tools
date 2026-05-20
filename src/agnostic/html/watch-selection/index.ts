import { deepSelect } from '../deep-select/index.js'

/** Options for `watchSelection`. */
type Options = {
  /** Called when a matching element newly appears in the selection. Defaults to a no-op. */
  watch?: (elt: Element) => void
  /** Called when a matching element is no longer in the selection. Defaults to a no-op. */
  unwatch?: (elt: Element) => void
  /** Interval in milliseconds between selection polls. Defaults to `100`. */
  selectIntervalMs?: number
}

/**
 * Watches a CSS selector over time and invokes callbacks when the matching set changes.
 *
 * Performs an initial `deepSelect`, calls `watch` on every match, then polls on a fixed interval.
 * On each poll, newly matched elements trigger `watch` and elements that disappeared trigger
 * `unwatch`. Comparison uses element identity (`===`), not structural equality.
 *
 * Requires a browser environment with `window` and `document`.
 *
 * @param {string} selector - CSS selector passed to `deepSelect`.
 * @param {Options} options - Callbacks and polling configuration:
 *   - `watch`: Handler for elements that enter the selection.
 *   - `unwatch`: Handler for elements that leave the selection.
 *   - `selectIntervalMs`: Delay between polls in milliseconds.
 * @returns {Promise<{ kill: () => void }>}
 * Resolves after the initial selection is processed. `kill` stops polling and calls `unwatch`
 * on every element still watched.
 *
 * @example
 * const { kill } = await watchSelection('.widget', {
 *   watch: elt => elt.classList.add('is-active'),
 *   unwatch: elt => elt.classList.remove('is-active'),
 * })
 *
 * @example
 * // later, when tearing down:
 * kill()
 */
export const watchSelection = async (
  selector: string,
  options: Options
): Promise<{ kill: () => void }> => {
  const watch = options?.watch ?? (() => {})
  const unwatch = options?.unwatch ?? (() => {})
  let watched = await deepSelect(selector)
  watched.forEach(watch)
  const selectIntervalMs = options?.selectIntervalMs ?? 100
  const interval = window.setInterval(() => {
    void deepSelect(selector).then(watchedNow => {
      const staleWatched = watched.filter(elt => !watchedNow.includes(elt))
      const newWatched = watchedNow.filter(elt => !watched.includes(elt))
      staleWatched.forEach(unwatch)
      newWatched.forEach(watch)
      watched = watchedNow
    })
  }, selectIntervalMs)
  const kill = (): void => {
    window.clearInterval(interval)
    watched.forEach(unwatch)
  }
  return { kill }
}
