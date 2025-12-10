import { unknownToString } from '../../../../../errors/unknown-to-string/index.js'
import { Outcome } from '../../../../../misc/outcome/index.js'
import { Cast } from '../../../cast/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'
import {
  elementItemSymbol,
  nodelistItemSymbol,
  textItemSymbol
} from '../hjstringify/index.js'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | Array<JsonValue> | { [k: string]: JsonValue }

type Main = string | Text
type Args = []
type Output = Types.Tree.RestingValue

function isJson (value: unknown): value is JsonValue {
  if (value === undefined) return false
  if (typeof value === 'string') return true
  if (typeof value === 'number') return true
  if (typeof value === 'boolean') return true
  if (value === null) return true
  if (Array.isArray(value)) return value.every(isJson)
  return Object.entries(value).every(([name, val]) => {
    if (typeof name !== 'string') return false
    return isJson(val)
  })
}

function parse (val: string | Text): JsonValue | Error {
  const strInput = Cast.toString(val)
  try {
    const jsonParsed = JSON.parse(strInput)
    if (!isJson(jsonParsed)) return new Error(`Invalid JSON.parse output from ${strInput}`)
    return jsonParsed
  } catch (err) {
    if (err instanceof Error) return err
    const errStr = unknownToString(err)
    return new Error(errStr)
  }
}

function unescapeHyperJsonString (val: string): string | Text | Element | NodeListOf<Text | Element> {
  if (val.startsWith(textItemSymbol)) {
    const trimmed = val.slice(textItemSymbol.length)
    const textItem = document.createTextNode(trimmed)
    return textItem
  }
  if (val.startsWith(elementItemSymbol)) {
    const trimmed = val.slice(elementItemSymbol.length)
    const div = document.createElement('div')
    div.innerHTML = trimmed
    const firstChild = div.firstChild
    if (firstChild instanceof Element) return firstChild
    return trimmed
  }
  if (val.startsWith(nodelistItemSymbol)) {
    const trimmed = val.slice(nodelistItemSymbol.length)
    const div = document.createElement('div')
    div.innerHTML = trimmed
    const childNodesArr = Array.from(div.childNodes)
    const frag = document.createDocumentFragment()
    Array.from(childNodesArr).forEach(childNode => {
      if (childNode instanceof Text) frag.append(childNode)
      else if (childNode instanceof Element) frag.append(childNode)
    })
    return frag.childNodes as NodeListOf<Text | Element>
  }
  return val
}

function unescapeHyperJson (val: JsonValue): Types.Tree.RestingValue {
  if (typeof val === 'number'
    || typeof val === 'boolean'
    || val === null) return val
  if (typeof val === 'string') return unescapeHyperJsonString(val)
  if (Array.isArray(val)) return val.map(unescapeHyperJson)
  return Object.entries(val).reduce((acc, [currKey, currVal]) => ({
    ...acc,
    [currKey]: unescapeHyperJson(currVal)
  }), {})
}

export const hjparse = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'hjparse',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    const parsed = parse(main)
    if (parsed instanceof Error) return Outcome.makeFailure({ details: parsed }) // [WIP] details accepts any, but maybe better if string here?
    try {
      const unescaped = unescapeHyperJson(parsed)
      return Outcome.makeSuccess(unescaped)
    } catch (err) {
      return Outcome.makeFailure({ details: err })
    }
  }
})
