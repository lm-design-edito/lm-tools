import * as Window from '../../misc/crossenv/window/index.js'
import { deepGetProperty } from '../../objects/deep-get-property/index.js'
import { isRecord } from '../../objects/is-record/index.js'

/** Options for `deepSelect`. */
type Options = {
  /** Root node to start traversal from. Defaults to `document`. */
  fromElement?: Element | Document | ShadowRoot
  /** Number of element nodes to visit before yielding to the main thread. Defaults to `500`. */
  chunkSize?: number
}

const yieldToMain = async (windowLike: unknown): Promise<void> => {
  const scheduler = deepGetProperty(windowLike, 'scheduler')
  const yild = isRecord(scheduler) ? scheduler.yield : undefined
  // `scheduler.yield` must run with `scheduler` as its `this` — a detached reference throws "Illegal invocation".
  if (typeof yild === 'function') await yild.call(scheduler)
  else await new Promise(resolve => { setTimeout(resolve, 0) })
}

/**
 * Queries the DOM for all elements matching a CSS selector, including inside open shadow roots.
 *
 * Runs `querySelectorAll` once per tree, then descends into every `element.shadowRoot` it finds,
 * which standard selectors do not pierce. The traversal root (`fromElement` or `document`) is
 * never included in the results, even if it matches. Closed shadow roots are unreachable.
 *
 * Yields to the main thread every `chunkSize` visited elements, using `scheduler.yield()` when
 * available or `setTimeout(0)` as a fallback. A yield costs far more than the walk itself, so a
 * caller that repeats the query wants a `chunkSize` large enough never to be reached. Requires a
 * browser environment with `document`.
 *
 * @param selector - CSS selector passed to `querySelectorAll`.
 * @param [options] - Optional configuration:
 *   - `fromElement`: Element, document or shadow root to start the walk from.
 *   - `chunkSize`: How many elements to visit between yields.
 * @returns All matching elements, each tree in document order, a shadow root's matches following
 * those of the tree that hosts it.
 *
 * @example
 * const items = await deepSelect('[data-item]', { fromElement: app })
 *
 * @example
 * const labels = await deepSelect('.label', { chunkSize: 100 })
 */
export const deepSelect = async (
  selector: string,
  options?: Options
): Promise<Element[]> => {
  const window = Window.get()
  const { document } = window
  const from = options?.fromElement ?? document
  const results: Element[] = []
  const chunkSize = options?.chunkSize ?? 500
  let nodeCount = 0
  const traverse = async (root: Element | Document | ShadowRoot): Promise<void> => {
    // Spreading into push would blow the call stack on a large tree.
    root.querySelectorAll(selector).forEach(elt => { results.push(elt) })
    const all = root.querySelectorAll('*')
    nodeCount = nodeCount + all.length
    if (nodeCount >= chunkSize) {
      nodeCount = 0
      await yieldToMain(window)
    }
    for (const elt of all) {
      if (elt.shadowRoot !== null) await traverse(elt.shadowRoot)
    }
  }
  await traverse(from)
  return results
}
