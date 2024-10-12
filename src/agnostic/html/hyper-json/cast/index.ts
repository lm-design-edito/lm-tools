import { isRecord } from '~/agnostic/objects/is-record'
import { isFalsy } from '~/agnostic/booleans/is-falsy'
import { Types } from '../types'
import { Crossenv } from '../crossenv'
import { Transformers } from '../transformers'

type Value = Types.Value
type Transformer = Types.Transformer
const getWindow = Crossenv.getWindow

export namespace Cast {
  export const toNull = (): null => null
  export const toBoolean = (input: Value): boolean => !isFalsy(input)
  export const toNumber = (input: Value): number => {
    if (typeof input === 'number') return input
    if (typeof input === 'string') return parseFloat(`${input}`)
    if (input instanceof getWindow().Text) return parseFloat(`${input.textContent}`)
    return 0
  }

  export const toString = (input: Value): string => {
    if (typeof input === 'string') return input
    if (typeof input === 'number'
      || typeof input === 'boolean'
      || input === null) return `${input}`
    if (input instanceof getWindow().Element) return input.outerHTML
    if (input instanceof getWindow().Text) return input.textContent ?? ''
    if (input instanceof getWindow().NodeList) return Array.from(input).map(e => {
      if (e instanceof getWindow().Element) return e.outerHTML
      return e.textContent
    }).join('')
    return input.toString()
  }
  
  export const toText = (input: Value): Text => {
    if (input instanceof getWindow().Text) return input.cloneNode(true) as Text
    return getWindow().document.createTextNode(toString(input))
  }
  
  export const toElement = (input: Value): Element => {
    if (input instanceof getWindow().Element) return input.cloneNode(true) as Element
    const elt = getWindow().document.createElement('div')
    if (input instanceof getWindow().Text) {
      elt.append(input.cloneNode(true))
      return elt
    }
    if (input instanceof getWindow().NodeList) {
      elt.append(...Array.from(input).map(e => e.cloneNode(true)))
      return elt
    }
    if (Array.isArray(input)) return elt
    if (isRecord(input)) return elt
    elt.append(`${input}`)
    return elt
  }

  export const toNodeList = (input: Value): NodeListOf<Element | Text> => {
    const elt = getWindow().document.createElement('div')
    if (input instanceof getWindow().NodeList) {
      elt.append(...Array.from(input).map(i => i.cloneNode(true)))
      return elt.childNodes as NodeListOf<Element | Text>
    }
    if (input instanceof getWindow().Element
      || input instanceof getWindow().Text) {
      elt.append(input.cloneNode(true) as Element | Text)
      return elt.childNodes as NodeListOf<Element | Text>
    }
    if (Array.isArray(input)) return elt.childNodes as NodeListOf<Element | Text>
    if (isRecord(input)) return elt.childNodes as NodeListOf<Element | Text>
    elt.innerHTML = `${input}`
    return elt.childNodes as NodeListOf<Element | Text>
  }

  export const toArray = (input: Value): Value[] => {
    if (Array.isArray(input)) return [...input]
    if (input instanceof getWindow().NodeList) return Array.from(input)
    return [input]
  }

  export const toRecord = (input: Value): ({ [k: string]: Value }) => {
    if (isRecord(input)) return { ...input }
    return {}
  }

  export const toTransformer = (input: Value): Transformer => {
    return Transformers.toNamed('utils/Cast.toTransformer', () => ({
      action: 'REPLACE',
      value: input
    }))
  }
}
