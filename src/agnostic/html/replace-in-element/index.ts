import { getNodeAncestors } from '../get-node-ancestors/index.js'

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
