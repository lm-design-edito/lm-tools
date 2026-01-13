import * as Window from '../../misc/crossenv/window/index.js'

/**
 * Creates a DOM element from a CSS-like selector string.
 * Tag name defaults to div.
 *
 * Supports simple tag, ID, class, and attribute syntax:
 * - Tag name (e.g., `"div"`)
 * - ID (e.g., `"#myId"`)
 * - Classes (e.g., `".class1.class2"`)
 * - Attributes (e.g., `"[attr=value]"`)
 *
 * @param {string} selector - The selector string used to construct the element.
 * @returns {Element} A newly created DOM element corresponding to the selector.
 *
 * @throws Will throw an error if no document object is available for element creation.
 */
export function selectorToElement (selector: string): Element {
  // RegExps
  const tagRegexp = /^[A-Za-z]+/
  // The dot is apparently a valid character but is prevented here
  // in order to be able to match class elements
  const idRegexp = /#[A-Za-z]+[\w\-\:]*/
  const classRegexp = /\.[A-Za-z]+[\w\-]*/
  const attributeRegexp = /\[[A-Za-z]+[\w\-]*(="[\w\-]+")?\]/
  // Matched
  const matchedTags = selector.match(tagRegexp) ?? []
  const matchedIds = selector.match(idRegexp) ?? []
  const matchedClasses = selector.match(classRegexp) ?? []
  const matchedAttrs = selector.match(attributeRegexp) ?? []
  // Extracted
  const tag = matchedTags[matchedTags.length - 1] ?? 'div'
  const id = matchedIds[matchedIds.length - 1] ?? null
  const classes = matchedClasses.map(matchedClass => matchedClass.replace(/^\./, ''))
  const attributes = matchedAttrs.map(matchedAttr => matchedAttr
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split('='))
  // Returning
  const element = Window.get().document.createElement(tag)
  if (id !== null) { element.id = id }
  element.classList.add(...classes)
  attributes.forEach(([name, value = '']) => {
    if (name === undefined) return;
    element.setAttribute(name, value)
  })
  return element
}
