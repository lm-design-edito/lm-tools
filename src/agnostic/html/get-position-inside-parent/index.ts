/**
 * Returns the index position of a node within its parent’s `childNodes` list.
 *
 * @param node - The DOM node whose position is to be determined.
 * @returns
 * - The zero-based index of the node within its parent’s `childNodes`.
 * - `null` if the node has no parent.
 */
export function getPositionInsideParent (node: Node): number | null {
  if (node.parentNode === null) return null
  const childNodes = Array.from(node.parentNode.childNodes) as Node[]
  return childNodes.indexOf(node)
}
