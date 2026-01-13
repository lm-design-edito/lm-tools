import * as Window from '../../misc/crossenv/window/index.js'
import * as Sanitize from '../../html/sanitize/index.js'

type Options = {
  sanitize?: Sanitize.Options
}

// [WIP] should not embed sanitizing stuff
/**
 * Converts a string into an array of DOM nodes.
 *
 * If sanitization options are provided, the string is first sanitized
 * using `Sanitize.sanitize`.
 *
 * Only element and text nodes are included in the returned array; comment
 * and other node types are ignored.
 *
 * @param {string} dirtyStr - The input string to convert into nodes.
 * @param {Options} [options] - Optional configuration.
 * @param {Sanitize.Options} [options.sanitize] - Sanitization options for the input string.
 * @returns {Node[]} An array of DOM nodes created from the string.
 *
 * @throws Will throw an error if no document object is available for node creation.
 */
export function stringToNodes (dirtyStr: string, options?: Options): Node[] {
  const sanitizeOptions: Sanitize.Options = { ...options?.sanitize }
  const str = options?.sanitize !== undefined ? Sanitize.sanitize(dirtyStr, sanitizeOptions) : dirtyStr
  const wrapperDiv = Window.get().document.createElement('div')
  wrapperDiv.innerHTML = str
  const nodes = Array.from(wrapperDiv.childNodes).filter(node => {
    const allowedNodeTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE]
    return allowedNodeTypes.includes(node.nodeType)
  })
  return nodes
}
