/**
 * Returns the list of ancestor nodes for a given DOM node, including the node
 * itself, walking up through parent elements.
 *
 * By default, traversal stops at shadow root boundaries. When
 * `traverseShadowRoots` is `true`, the traversal continues from a `ShadowRoot`
 * to its host element.
 *
 * @param {Node} node - The starting DOM node.
 * @param {boolean} [traverseShadowRoots] - Whether to traverse through shadow roots via their host elements.
 * @returns {Node[]} An array of ancestor nodes, starting with the provided node.
 */
export function getNodeAncestors (
  node: Node,
  traverseShadowRoots?: boolean
): Node[] {
  const returned: Node[] = []
  let currentNode: Node | null = node
  while (currentNode !== null) {
    returned.push(currentNode)
    const parentNode = currentNode.parentNode as ParentNode | null
    const parentElement = currentNode.parentElement as HTMLElement | null
    const nextNode = parentNode instanceof ShadowRoot
      ? (traverseShadowRoots ? parentNode.host : parentElement)
      : parentElement
    currentNode = nextNode
  }
  return returned
}
