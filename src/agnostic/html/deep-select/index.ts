/** Options for `deepSelect`. */
type Options = {
  /** Root node to start traversal from. Defaults to `document`. */
  fromElement?: Element
  /** Number of element nodes to visit before yielding to the main thread. Defaults to `500`. */
  chunkSize?: number
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
 * @param {string} selector - CSS selector tested with `Element.prototype.matches`.
 * @param {Options} [options] - Optional configuration:
 *   - `fromElement`: Element (or `document`) to start the walk from.
 *   - `chunkSize`: How many element nodes to process between yields.
 * @returns {Promise<Element[]>} All matching elements in tree-walker order (depth-first).
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
  const from = options?.fromElement ?? document
  const results: Element[] = []
  const chunkSize = options?.chunkSize ?? 500
  let nodeCount = 0
  const traverse = async (root: Element | Document | ShadowRoot) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
    let node = walker.currentNode as Element
    while (node) {
      if (node !== root && node.matches(selector)) results.push(node)
      if (node.shadowRoot) await traverse(node.shadowRoot)
      nodeCount++
      if (nodeCount % chunkSize === 0) await (async () => {
        if (typeof window.scheduler?.yield === 'function') return window.scheduler.yield()
        return new Promise(resolve => setTimeout(resolve, 0))
      })()
      node = walker.nextNode() as Element
    }
  }
  await traverse(from)
  return results
}
