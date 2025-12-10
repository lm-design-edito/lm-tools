import { Outcome } from '../../../../../misc/outcome/index.js'
import { Method } from '../../../method/index.js'
import { Types } from '../../../types/index.js'
import { Utils } from '../../../utils/index.js'
import { SmartTags } from '../../index.js'

type Main = Types.Tree.RestingValue
type Args = [] // [WIP] could add an optional "dont add symbols" and convert all Text, Element, Nodelist to plain strings later ?
type Output = string

export const textItemSymbol = '%%-hyperjson-text-%%'
export const nodelistItemSymbol = '%%-hyperjson-nodelist-%%'
export const nodelistItemSplitterSymbol = '%%-hyperjson-nodelist-splitter-%%'
export const elementItemSymbol = '%%-hyperjson-element-%%'

function stringifier (val: Types.Tree.RestingValue): string {
  if (typeof val === 'string') return `"${val}"`
  if (typeof val === 'number'
    || typeof val === 'boolean'
    || val === null) return `${val}`
  if (val instanceof Text) return `"${textItemSymbol}${val.textContent}"`
  if (val instanceof Element) return `"${elementItemSymbol}${val.outerHTML}"`
  if (val instanceof NodeList) {
    const items = Array.from(val)
    return `"${nodelistItemSymbol}${items.map(stringifier).join(nodelistItemSplitterSymbol)}"`
  }
  if (val instanceof Method) return `"[Object method]"`
  if (Array.isArray(val)) return `[${val.map(stringifier).join(', ')}]`
  return `{ ${Object.entries(val).map(([key, val]) => `"${key}": ${stringifier(val)}`).join(', ')} }`
}

export const hjstringify = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'hjstringify',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    const stringified = stringifier(main)
    return Outcome.makeSuccess(stringified)
  }
})
