import * as Window from '../../misc/crossenv/window/index.js'
import { deepGetProperty } from '../../objects/deep-get-property/index.js'
import { isRecord } from '../../objects/is-record/index.js'

/** Options for `deepSelect`. */
type Options = {
  /** Root node to start traversal from. Defaults to `document`. */
  fromElement?: Element
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
 * Walks the tree with `document.createTreeWalker` instead of `querySelectorAll`, so traversal can
 * descend into `element.shadowRoot` trees that standard selectors do not pierce. The traversal
 * root (`fromElement` or `document`) is never included in the results, even if it matches.
 *
 * Yields to the main thread every `chunkSize` visited nodes, using `scheduler.yield()` when
 * available or `setTimeout(0)` as a fallback. Requires a browser environment with `document`.
 *
 * @param selector - CSS selector tested with `Element.prototype.matches`.
 * @param [options] - Optional configuration:
 *   - `fromElement`: Element (or `document`) to start the walk from.
 *   - `chunkSize`: How many element nodes to process between yields.
 * @returns All matching elements in tree-walker order (depth-first).
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
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
    let node: Node | null = walker.currentNode
    while (node !== null) {
      if (node !== root && node instanceof Element && node.matches(selector)) results.push(node)
      if (node instanceof Element && node.shadowRoot !== null) await traverse(node.shadowRoot)
      nodeCount = nodeCount + 1
      if (nodeCount % chunkSize === 0) await yieldToMain(window)
      node = walker.nextNode()
    }
  }
  await traverse(from)
  return results
}
