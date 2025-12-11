import { Window } from '../../../../../misc/crossenv/window/index.js'
import { isNonNullObject } from '../../../../../objects/is-object/index.js'
import { Outcome } from '../../../../../misc/outcome/index.js'
import { Method } from '../../../method/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = [] // [WIP] could add an optional "dont add symbols" and convert all Text, Element, Nodelist to plain strings later ?
type Output = string

const textItemSymbol = '%%-hyperjson-text-%%'
const nodelistItemSymbol = '%%-hyperjson-nodelist-%%'
const elementItemSymbol = '%%-hyperjson-element-%%'

export function stringify (val: Types.Tree.RestingValue): string {
  const { Text, Element, NodeList } = Window.get()
  if (typeof val === 'string'
    || typeof val === 'number'
    || typeof val === 'boolean'
    || val === null
  ) return JSON.stringify(val)
  if (val instanceof Text) return JSON.stringify(`${textItemSymbol}${val.textContent}`)
  if (val instanceof Element) return JSON.stringify(`${elementItemSymbol}${val.outerHTML}`)
  if (val instanceof NodeList) {
    const stringifiedItems = JSON.stringify(Array.from(val).map(stringify))
    return JSON.stringify(`${nodelistItemSymbol}${stringifiedItems}`)
  }
  if (val instanceof Method) return JSON.stringify(`[Method object: ${val.transformer.name}]`)
  if (Array.isArray(val)) return JSON.stringify(val.map(stringify))
  return JSON.stringify(Object
    .entries(val)
    .reduce((acc, [key, val]) => ({
      ...acc,
      [key]: stringify(val)
    }), {})
  )
}

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | Array<JsonValue> | { [k: string]: JsonValue }

export function parse (val: string): Types.Tree.RestingValue {
  const { document } = Window.get()
  const jsonParsed: JsonValue = JSON.parse(val)
  if (typeof jsonParsed === 'number'
    || typeof jsonParsed === 'boolean'
    || jsonParsed === null) return jsonParsed
  if (Array.isArray(jsonParsed)) return jsonParsed.map(e => typeof e === 'string' ? parse(e) : e)
  if (isNonNullObject(jsonParsed)) return Object
    .entries(jsonParsed)
    .reduce((acc, [key, val]) => ({
      ...acc,
      [key]: typeof val === 'string'
        ? parse(val)
        : val
    }), {})
  if (jsonParsed.startsWith(textItemSymbol)) return document.createTextNode(jsonParsed.slice(textItemSymbol.length))
  if (jsonParsed.startsWith(elementItemSymbol)) {
    const wrapperDiv = document.createElement('div')
    wrapperDiv.innerHTML = jsonParsed.slice(elementItemSymbol.length)
    return wrapperDiv.firstChild as Element | Text | null
  }
  if (jsonParsed.startsWith(nodelistItemSymbol)) {
    const stringifiedItems = jsonParsed.slice(nodelistItemSymbol.length)
    const jsonParsedItems = JSON.parse(stringifiedItems) as JsonValue[]
    const hjParsedItems = jsonParsedItems.map(e => typeof e === 'string' ? parse(e) : e)
    const wrapperDiv = document.createElement('div')
    hjParsedItems.forEach(item => {
      if (typeof item === 'number'
        || typeof item === 'boolean'
        || item === null) return wrapperDiv.append(`${item}`)
      if (typeof item === 'string'
        || item instanceof Text
        || item instanceof Element
      ) return wrapperDiv.append(item)
      if (item instanceof NodeList) return wrapperDiv.append(...Array.from(item))
      // Method, Arrays and Records are ignored here
    })
    return wrapperDiv.childNodes as NodeListOf<Element | Text>
  }
  return jsonParsed
}

export const hjstringify = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'hjstringify',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    const stringified = stringify(main)
    return Outcome.makeSuccess(stringified)
  }
})
