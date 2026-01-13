/**
 * Describes the relative position where a node should be inserted
 * with respect to a reference node.
 *
 * - `'before'`  : Insert before the reference node, as a sibling.
 * - `'after'`   : Insert after the reference node, as a sibling.
 * - `'startof'` : Insert as the first child of the reference node.
 * - `'endof'`   : Insert as the last child of the reference node.
 */
export type InsertNodePosition = 'after' | 'before' | 'startof' | 'endof'

/**
 * Inserts a DOM node at a specific position relative to a reference node.
 *
 * @param {Node} node - The node to insert.
 * @param {InsertNodePosition} position - The insertion position relative to the reference node.
 * @param {Node} reference - The reference node used to determine the insertion point.
 * @returns {void}
 */
export function insertNode (
  node: Node,
  position: InsertNodePosition,
  reference: Node
): void {
  if (position === 'after') {
    if (reference.nextSibling !== null) reference.parentNode?.insertBefore(node, reference.nextSibling)
    else reference.parentNode?.appendChild(node)
  } else if (position === 'before') {
    reference.parentNode?.insertBefore(node, reference)
  } else if (position === 'startof') {
    if (reference.firstChild !== null) reference.insertBefore(node, reference.firstChild)
    else reference.appendChild(node)
  } else {
    reference.appendChild(node)
  }
}
