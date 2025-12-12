import { Outcome } from '../../../../../misc/outcome/index.js'
import { isRecord } from '../../../../../objects/is-record/index.js'
import { Cast } from '../../../cast/index.js'
import { Utils } from '../../../utils/index.js'
import { Types } from '../../../types/index.js'
import { SmartTags } from '../../index.js'
import { Window } from '../../../../../misc/crossenv/window/index.js'
import { Method } from '../../../method/index.js'

type Main = string | number | boolean | null | Text | Element | NodeListOf<Text | Element> | Types.Tree.RestingArrayValue | Types.Tree.RestingRecordValue
type Args = [string | Text, Types.Tree.RestingValue]
type Output = string | number | boolean | null | Text | Element | NodeListOf<Text | Element> | Types.Tree.RestingArrayValue | Types.Tree.RestingRecordValue

export const setproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'setproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(
    m,
    'string',
    'number',
    'boolean',
    'null',
    'text',
    'element',
    'nodelist',
    'record',
    'array'
  ),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheck } = Utils.Tree.TypeChecks
    if (a.length === 0) return makeFailure(makeArgsValueError('string | Text', 'undefined', 0))
    if (a.length === 1) return makeFailure(makeArgsValueError('value', 'undefined', 1))
    if (a.length !== 2) return makeFailure(makeArgsValueError('undefined', getType(a.at(2)) ?? 'undefined', 2))
    const [first, second] = a as [Types.Tree.RestingValue, Types.Tree.RestingValue]
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(firstChecked.error.expected, firstChecked.error.found, 0))
    return makeSuccess([firstChecked.payload, second] as Args)
  },
  func: (main, args) => {
    const [key, val] = args
    const { makeSuccess, makeFailure } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    try {
      const withPropertySet = deepSetProperty(
        Utils.clone(main),
        Cast.toString(key),
        val)
      return makeSuccess(withPropertySet)
    } catch (err) {
      return makeFailure(makeTransformationError(`Impossible to access property :${key}`))
    }
  }
})

export function deepSetProperty (
  input: Exclude<Types.Tree.RestingValue, Types.Tree.MethodValue>,
  pathString: string,
  value: Types.Tree.RestingValue
): Exclude<Types.Tree.RestingValue, Types.Tree.MethodValue> {
  const pathChunks = pathString.split('.')
  let clone = Utils.clone(input)
  let currentItemParent: Types.Tree.RestingValue | undefined = undefined
  let currentItemPathFromParent: string | number | undefined = undefined
  let currentItem: Types.Tree.RestingValue = clone
  const { Text, Element, NodeList, document } = Window.get()
  pathChunks.forEach((chunk, pos) => {
    const isLast = pos === pathChunks.length - 1
    const numChunk = parseInt(chunk)

    // LAST PATH CHUNK, actual mutation
    if (isLast) {
      // Set on number, boolean, null, Method : impossible
      if (typeof currentItem === 'number'
        || typeof currentItem === 'boolean'
        || currentItem === null
        || currentItem instanceof Method) throw `DEAD_END: Cannot set properties on a string, number, boolean, null or Method item`
      // Set on string
      else if (typeof currentItem === 'string') {
        if (currentItemParent !== undefined && currentItemPathFromParent === undefined) throw `INVALID_PROP: Could not access item's child at ${currentItemPathFromParent} found at pos ${pos - 1} in path ${pathChunks.join('.')}`
        if (Number.isNaN(numChunk)
          || numChunk < 0
          || numChunk > currentItem.length) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        const newString = currentItem.slice(0, numChunk)
          + Cast.toString(value)
          + currentItem.slice(numChunk + 1)
        if (currentItemParent === undefined) { clone = newString }
        if (Array.isArray(currentItemParent)) {
          if (typeof currentItemPathFromParent !== 'number') throw `IMPOSSIBLE_OPERATION: non-number path from an Array parent, this is a bug`
          currentItemParent[currentItemPathFromParent] = newString
        } else if (isRecord(currentItemParent)) {
          if (typeof currentItemPathFromParent !== 'string') throw `IMPOSSIBLE_OPERATION: non-string path from an Record parent, this is a bug`
          currentItemParent[currentItemPathFromParent] = newString
        } else throw `IMPOSSIBLE_OPERATION: a string item should not be a child of anything else than Array or Record, cannot mutate. At ${currentItemPathFromParent} found at pos ${pos - 1} in path ${pathChunks.join('.')}`
      }
      // Set on Array
      else if (Array.isArray(currentItem)) {
        if (Number.isNaN(numChunk)
          || numChunk < 0
          || numChunk > currentItem.length) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        if (numChunk === currentItem.length) currentItem.push(Utils.clone(value))
        else { currentItem[numChunk] = Utils.clone(value) }
      }
      // Set on Text
      else if (currentItem instanceof Text) {
        const currContent = currentItem.textContent
        if (Number.isNaN(numChunk)
          || numChunk < 0
          || numChunk > currContent.length) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`  
        const newContent = [
          ...currContent.slice(0, numChunk),
          ...Cast.toString(value),
          ...currContent.slice(numChunk)
        ].join('')
        currentItem.textContent = newContent
      }
      // Set on Element
      else if (currentItem instanceof Element) {
        const currChildren = Array
          .from(currentItem.childNodes)
          .filter(e => e instanceof Text || e instanceof Element)
        if (Number.isNaN(numChunk)
          || numChunk < 0
          || numChunk > currChildren.length) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        let newValue: Text | Element | NodeListOf<Text | Element>
        if (value instanceof NodeList
          || value instanceof Element
          || value instanceof Text
        ) { newValue = Utils.clone(value) }
        else { newValue = Cast.toText(value) }
        const newChildren = [...currChildren.slice(0, numChunk)]
        if (newValue instanceof NodeList) newChildren.push(...Array.from(newValue))
        else newChildren.push(newValue)
        newChildren.push(...currChildren.slice(numChunk + 1))
        currentItem.textContent = ''
        currentItem.append(...newChildren)
      }
      // Set on NodeList
      else if (currentItem instanceof NodeList) {
        const currChildren = Array.from(currentItem)
        if (Number.isNaN(numChunk)
          || numChunk < 0
          || numChunk > currChildren.length) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        let newValue: Text | Element | NodeListOf<Text | Element>
        if (value instanceof NodeList
          || value instanceof Element
          || value instanceof Text
        ) { newValue = Utils.clone(value) }
        else { newValue = Cast.toText(value) }
        const newChildren = [...currChildren.slice(0, numChunk)]
        if (newValue instanceof NodeList) newChildren.push(...Array.from(newValue))
        else newChildren.push(newValue)
        newChildren.push(...currChildren.slice(numChunk + 1))
        const newNodelistFragment = document.createDocumentFragment()
        newNodelistFragment.append(...newChildren)
        const newNodelist = newNodelistFragment.childNodes as NodeListOf<Text | Element>
        if (currentItemParent === undefined) { clone = newNodelist }
        if (Array.isArray(currentItemParent)) {
          if (typeof currentItemPathFromParent !== 'number') throw `IMPOSSIBLE_OPERATION: non-number path from an Array parent, this is a bug`
          currentItemParent[currentItemPathFromParent] = newNodelist
        } else if (isRecord(currentItemParent)) {
          if (typeof currentItemPathFromParent !== 'string') throw `IMPOSSIBLE_OPERATION: non-string path from an Record parent, this is a bug`
          currentItemParent[currentItemPathFromParent] = newNodelist
        } else throw `IMPOSSIBLE_OPERATION: a Nodelist item should not be a child of anything else than Array or Record, cannot mutate. At ${currentItemPathFromParent} found at pos ${pos - 1} in path ${pathChunks.join('.')}`
      }
      // Set on Record
      else { currentItem[chunk] = Utils.clone(value) }
    }

    // NOT LAST PATH CHUNK, select child and go deeper
    else {
      // [WIP] this logic could probably be shared with getProperty smart-tag logic
      if (typeof currentItem === 'string'
        || typeof currentItem === 'number'
        || typeof currentItem === 'boolean'
        || currentItem === null
        || currentItem instanceof Text
        || currentItem instanceof Method
      ) throw `DEAD_END: Cannot go deeper when a string, number, boolean, null, Text or Method item is reached`
      if (currentItem instanceof Element) {
        const children = Array
          .from(currentItem.childNodes)
          .filter(e => e instanceof Text || e instanceof Element)
        const found = children[numChunk]
        if (found === undefined) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        currentItemParent = currentItem
        currentItemPathFromParent = numChunk
        currentItem = found
      } else if (currentItem instanceof NodeList) {
        const children = Array.from(currentItem)
        const found = children[numChunk]
        if (found === undefined) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        currentItemParent = currentItem
        currentItemPathFromParent = numChunk
        currentItem = found
      } else if (Array.isArray(currentItem)) {
        const found = currentItem[numChunk]
        if (found === undefined) throw `INVALID_PROP: Could not access item's child at ${numChunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        currentItemParent = currentItem
        currentItemPathFromParent = numChunk
        currentItem = found
      } else {
        const found = currentItem[chunk]
        if (found === undefined) throw `INVALID_PROP: Could not access item's child at ${chunk} found at pos ${pos} in path ${pathChunks.join('.')}`
        currentItemParent = currentItem
        currentItemPathFromParent = chunk
        currentItem = found
      }
    }
  })
  return clone
}
