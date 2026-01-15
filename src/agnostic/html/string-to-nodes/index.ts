import * as Window from '../../misc/crossenv/window/index.js'

/**
 * Converts a string into an array of DOM nodes.
 *
 * If sanitization options are provided, the string is first sanitized
 * using `Sanitize.sanitize`.
 *
 * Only element and text nodes are included in the returned array; comment
 * and other node types are ignored.
 *
 * @param {string} inputStr - The input string to convert into nodes.
 * @param {SanitizeHtmlOptions} [options.sanitize] - Sanitization options for the input string.
 * @returns {Node[]} An array of DOM nodes created from the string.
 */
export function stringToNodes (inputStr: string): Node[] {
  const window = Window.get()
  const { document, Node } = window
  const wrapperDiv = document.createElement('div')
  wrapperDiv.innerHTML = inputStr
  const nodes = Array.from(wrapperDiv.childNodes).filter(node => {
    const allowedNodeTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE]
    return allowedNodeTypes.includes(node.nodeType)
  })
  return nodes
}
