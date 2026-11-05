import { deepSelect } from '../deep-select/index.js'

/** Options for `watchSelection`. */
type Options = {
  /** Called when a matching element newly appears in the selection. Defaults to a no-op. */
  watch?: (elt: Element) => void
  /** Called when a matching element is no longer in the selection. Defaults to a no-op. */
  unwatch?: (elt: Element) => void
  /** Delay in milliseconds between the end of one selection poll and the start of the next. Defaults to `100`. */
  selectIntervalMs?: number
  /** Subtree to watch. Defaults to `document`. */
  root?: Element | Document | ShadowRoot
}

/**
 * Watches a CSS selector over time and invokes callbacks when the matching set changes.
 *
 * Performs an initial `deepSelect`, calls `watch` on every match, then polls again `selectIntervalMs`
 * after each poll has finished, so two walks are never in flight at once. On each poll, newly matched
 * elements trigger `watch` and elements that disappeared trigger `unwatch`. Comparison uses element
 * identity (`===`), not structural equality.
 *
 * Polls never yield to the main thread: a short, uninterrupted walk leaves the thread freer than one
 * spread across the interval. Narrow the work with `root` rather than by polling less often.
 *
 * Requires a browser environment with `window` and `document`.
 *
 * @param selector - CSS selector passed to `deepSelect`.
 * @param options - Callbacks and polling configuration:
 *   - `watch`: Handler for elements that enter the selection.
 *   - `unwatch`: Handler for elements that leave the selection.
 *   - `selectIntervalMs`: Delay between polls in milliseconds.
 *   - `root`: Subtree to watch, instead of the whole document.
 * @returns Resolves after the initial selection is processed. `kill` stops polling and calls `unwatch`
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
  options?: Options
): Promise<{ kill: () => void }> => {
  const watch = options?.watch ?? (() => undefined)
  const unwatch = options?.unwatch ?? (() => undefined)
  const selectIntervalMs = options?.selectIntervalMs ?? 100
  const selectOptions = {
    fromElement: options?.root,
    chunkSize: Number.POSITIVE_INFINITY
  }
  let watched = await deepSelect(selector, selectOptions)
  watched.forEach(watch)
  let stopped = false
  let timeout = 0
  const poll = async (): Promise<void> => {
    const watchedNow = await deepSelect(selector, selectOptions)
    if (stopped) return
    const before = new Set(watched)
    const now = new Set(watchedNow)
    watched.forEach(elt => { if (!now.has(elt)) unwatch(elt) })
    watchedNow.forEach(elt => { if (!before.has(elt)) watch(elt) })
    watched = watchedNow
    timeout = window.setTimeout(() => { void poll() }, selectIntervalMs)
  }
  timeout = window.setTimeout(() => { void poll() }, selectIntervalMs)
  const kill = (): void => {
    stopped = true
    window.clearTimeout(timeout)
    watched.forEach(unwatch)
  }
  return { kill }
}
