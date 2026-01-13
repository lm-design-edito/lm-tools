// [WIP] this module should use crossenv

/**
 * Represents an attribute filtering rule for sanitization.
 *
 * - `attributeName`: The attribute name to match, either as a string or a RegExp.
 * - `attributeValues` (optional): Array of allowed or forbidden values for the attribute,
 *   each being a string or a RegExp. If omitted, all values are affected.
 */
export type AttributeNameValPair = {
  attributeName: string | RegExp
  attributeValues?: Array<string | RegExp>
}

/**
 * Configuration options for HTML sanitization.
 *
 * - `inputFreeTransform` (optional): Function applied to input HTML string before sanitization.
 * - `keepComments` (optional): Whether to preserve comment nodes. Default is `false`.
 * - `allowedTags` (optional): Array of allowed tag names. `'*'` allows all tags.
 * - `forbiddenTags` (optional): Array of forbidden tag names. `'*'` forbids all tags.
 * - `allowedAttributes` (optional): Object mapping tag names to allowed attributes (`AttributeNameValPair` arrays).
 * - `forbiddenAttributes` (optional): Object mapping tag names to forbidden attributes (`AttributeNameValPair` arrays).
 * - `depth` (optional): Maximum recursion depth for nested elements. Default is 20.
 * - `verbose` (optional): Enables console warnings for forbidden elements/attributes. Default is `false`.
 * - `documentObj` (optional): Document object used to create elements; defaults to `window.document`.
 */
export type Options = {
  inputFreeTransform?: (input: string) => string
  keepComments?: boolean
  allowedTags?: string[]
  forbiddenTags?: string[]
  allowedAttributes?: { [tagName: string]: AttributeNameValPair[] }
  forbiddenAttributes?: { [tagName: string]: AttributeNameValPair[] }
  depth?: number
  verbose?: boolean
  documentObj?: Document
}

/**
 * Default sanitization options.
 *
 * Only sets a default recursion depth of 20.
 */
export const defaultOptions: Options = { depth: 20 }

/**
 * Sanitizes an HTML string according to the provided options.
 *
 * @param {string} inputStr - The HTML string to sanitize.
 * @param {Sanitize.Options} [options=defaultOptions] - Sanitization configuration.
 * @returns {string} The sanitized HTML string.
 *
 * @throws Will throw an error if no document object is available for creating elements.
 */
export function sanitize (inputStr: string, options: Options = defaultOptions): string {
  const actualDocument = options.documentObj ?? window.document
  if (actualDocument === null) throw new Error('window.document is not defined')
  const wrapperDiv = actualDocument.createElement('div')
  const { inputFreeTransform } = options
  wrapperDiv.innerHTML = inputFreeTransform !== undefined ? inputFreeTransform(inputStr) : inputStr
  const sanitizedWrapper = sanitizeElement(wrapperDiv, options)
  const returned = sanitizedWrapper?.innerHTML
  return returned ?? ''
}

/**
 * Recursively sanitizes a DOM element and its descendants according to the provided options.
 *
 * @param {Element} element - The DOM element to sanitize.
 * @param {Sanitize.Options} [options=defaultOptions] - Sanitization configuration.
 * @returns {Element | null}
 * - A sanitized clone of the original element with allowed attributes and children.
 * - `null` if the element is forbidden or maximum recursion depth is reached.
 *
 * @throws Will throw an error if no document object is available for creating elements.
 */

export function sanitizeElement (
  element: Element,
  options: Options = defaultOptions): Element | null {
  const actualDocument = options.documentObj ?? window.document
  if (actualDocument === null) throw new Error('window.document is not defined')
  const { tagName, attributes, childNodes } = element
  const {
    allowedTags = [],
    allowedAttributes = {},
    forbiddenTags = [],
    forbiddenAttributes = {},
    depth = 20,
    verbose = false
  } = options
  if (depth <= 0) {
    console.warn('Max depth reached')
    return null
  }
  
  // Element's tag name checkup
  const normalizedTagName = tagName.toLowerCase().trim()
  const tagIsInForbidden = forbiddenTags.includes('*') || forbiddenTags.includes(normalizedTagName)
  if (tagIsInForbidden) {
    if (verbose === true) console.warn(tagName, 'tag is forbidden')
    return null
  }
  const tagIsInAllowed = allowedTags.includes('*') || allowedTags.includes(normalizedTagName)  
  if (!tagIsInAllowed) {
    if (verbose === true) console.warn(tagName, 'tag is not allowed')
    return null
  }
  const returnedElement = actualDocument.createElement(tagName)
  
  // Element's attributes checkup
  const returnedAttributes = Array.from(attributes).filter(({ name: attributeName, value: attributeValue }) => {
    const allTagsForbiddenAttributes = forbiddenAttributes['*'] ?? [] as AttributeNameValPair[]
    const thisTagForbiddenAttributes = forbiddenAttributes[normalizedTagName] ?? [] as AttributeNameValPair[]
    const mergedForbiddenAttributes: AttributeNameValPair[] = [...allTagsForbiddenAttributes, ...thisTagForbiddenAttributes]
    const isInForbidden = mergedForbiddenAttributes.some(({
      attributeName: nameTester,
      attributeValues: valTesters }) => {
      if (typeof nameTester === 'string' && nameTester !== '*' && attributeName !== nameTester) return false // attribute name doesnt match
      if (typeof nameTester !== 'string' && !nameTester.test(attributeName)) return false // attribute name doesnt match
      if (valTesters === undefined) {
        if (verbose === true) console.warn(attributeName, 'attribute on', tagName, 'tag is forbidden')
        return true // attribute name matches, and all values are forbidden
      }
      if (valTesters.includes('*')) {
        if (verbose === true) console.warn(attributeName, 'attribute on', tagName, 'tag is forbidden')
        return true // attribute name matches, and all values are EXPLICITLY forbidden
      }
      return valTesters.some(valTester => {
        if (typeof valTester === 'string' && attributeValue === valTester) {
          if (verbose === true) console.warn(attributeValue, 'value for', attributeName, 'attribute on', tagName, 'tag is forbidden. Rule:', valTester)
          return true // attribute value strictly matches
        }
        if (typeof valTester !== 'string' && valTester.test(attributeValue)) {
          if (verbose === true) console.warn(attributeValue, 'value for', attributeName, 'attribute on', tagName, 'tag is forbidden. Rule:', valTester)
          return true // attribute value partially matches
        }
        return false
      })
    })
    if (isInForbidden) return false
    const allTagsAllowedAttributes = allowedAttributes['*'] ?? [] as AttributeNameValPair[]
    const thisTagAllowedAttributes = allowedAttributes[normalizedTagName] ?? [] as AttributeNameValPair[]
    const mergedAllowedAttributes: AttributeNameValPair[] = [...allTagsAllowedAttributes, ...thisTagAllowedAttributes]
    let latestNotAllowedReason: string[] = [tagName, 'has no allowed attributes']
    const isInAllowed = mergedAllowedAttributes.some(({
      attributeName: nameTester,
      attributeValues: valTesters }) => {
      if (typeof nameTester === 'string' && nameTester !== '*' && attributeName !== nameTester) {
        latestNotAllowedReason = [attributeName, 'attribute on', tagName, 'tag is not allowed']
        return false // attribute name doesnt match
      }
      if (typeof nameTester !== 'string' && !nameTester.test(attributeName)) {
        latestNotAllowedReason = [attributeName, 'attribute on', tagName, 'tag is not allowed']
        return false // attribute name doesnt match
      }
      if (valTesters === undefined) return true // attribute name matches, and all values are allowed
      if (valTesters.includes('*')) return true // attribute name matches, and all values are EXPLICITLY allowed
      return valTesters.some(valTester => {
        if (typeof valTester === 'string' && attributeValue === valTester) return true // attribute value strictly matches
        if (typeof valTester !== 'string' && valTester.test(attributeValue)) return true // attribute value partially matches
        latestNotAllowedReason = [attributeValue, 'value for', attributeName, 'attribute on', tagName, 'tag is not allowed']
        return false
      })
    })
    if (!isInAllowed) {
      if (verbose === true) console.warn(...latestNotAllowedReason)
      return false
    }
    return true
  })
  
  returnedAttributes.forEach(({ name, value }) => {
    returnedElement.setAttribute(name, value)
  })
  // Element's children sanitization
  const sanitizedChildNodes = Array.from(childNodes)
    .map((node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) return sanitizeElement(node as Element, { ...options, depth: depth - 1 })
      else if (node.nodeType === Node.TEXT_NODE) return node
      else if (options.keepComments === true && node.nodeType === Node.COMMENT_NODE) return node
      return null
    })
    .filter((elt): elt is Node => elt !== null)

  returnedElement.replaceChildren(...sanitizedChildNodes)
  return returnedElement
}
