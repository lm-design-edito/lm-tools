import { getNodeAncestors } from '../get-node-ancestors/index.js'

/**
 * Replaces specific descendant nodes of a given element according to a
 * replacement map.
 *
 * Only entries whose target nodes are descendants of `inputElement`
 * are applied. Each target node is removed after its replacement node(s)
 * are inserted in its place.
 *
 * @param {Element} inputElement - The root element within which replacements are applied.
 * @param {Map<Node, Node | NodeListOf<Node>>} replaceMap
 * - A map associating nodes to be replaced with either a single replacement
 *   node or a list of replacement nodes.
 * @returns {Element} The original `inputElement`, after replacements have been applied.
 */
export function replaceInElement (inputElement: Element, replaceMap: Map<Node, Node | NodeListOf<Node>>): Element {
  const actualReplaceMap = new Map(Array.from(replaceMap).filter(([toReplace]) => {
    const toReplaceAncestors = getNodeAncestors(toReplace)
    return toReplaceAncestors.includes(inputElement)
  }))
  actualReplaceMap.forEach((replacer, toReplace) => {
    if ('nodeType' in replacer) {
      toReplace.parentNode?.insertBefore(replacer, toReplace)
    } else {
      const replacerNodes = Array.from(replacer)
      replacerNodes.forEach(rpl => toReplace.parentNode?.insertBefore(rpl, toReplace))
    }
    toReplace.parentNode?.removeChild(toReplace)
  })
  return inputElement
}
