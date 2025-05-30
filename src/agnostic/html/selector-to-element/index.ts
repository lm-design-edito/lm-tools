import * as ERR from '../../../shared/errors'

export function selectorToElement (selector: string, documentObj?: Document) {
  const actualDocument = documentObj ?? window.document
  if (actualDocument === null) throw ERR.register.getError(ERR.Codes.NO_DOCUMENT_PLEASE_PROVIDE, 'The optional second parameter expects a Document object')
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
  const classes = matchedClasses.map(matchedClass => matchedClass .replace(/^\./, ''))
  const attributes = matchedAttrs.map(matchedAttr => matchedAttr
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split('='))
  // Returning
  const element = actualDocument.createElement(tag)
  if (id !== null) { element.id = id }
  element.classList.add(...classes)
  attributes.forEach(([name, value = '']) => {
    if (name === undefined) return;
    element.setAttribute(name, value)
  })
  return element
}
