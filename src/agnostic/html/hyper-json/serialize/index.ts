import { Window } from '~/agnostic/misc/crossenv/window'
import { Types } from '../types'

export namespace Serialize {
  export function serialize (value: Types.Value): Types.Serialized {
    const { Text, Element, NodeList } = Window.get()
    if (value === null) return { type: 'null', value: null }
    if (typeof value === 'boolean'
      || typeof value === 'number'
      || typeof value === 'string') return { type: typeof value as any, value }
    if (value instanceof Text) return { type: 'text', value: value.textContent ?? '' }
    if (value instanceof Element) return { type: 'text', value: value.outerHTML }
    if (value instanceof NodeList) return {
      type: 'text',
      value: Array.from(value).map(e =>{
        if (e instanceof Text) return e.textContent
        return e.outerHTML
      }).join('')
    }
    if (Array.isArray(value)) return { type: 'array', value: value.map(serialize) }
    if (typeof value === 'function') return { type: 'transformer', value }
    return {
      type: 'record',
      value: Object
        .entries(value)
        .reduce((reduced, [key, val]) => ({
          ...reduced,
          [key]: serialize(val)
        }), {})
    }
  }

  export function deserialize (serialized: Types.Serialized): Types.Value {
    const { document } = Window.get()
    if (serialized.type === 'null') return null
    if (serialized.type === 'boolean') return serialized.value
    if (serialized.type === 'number') return serialized.value
    if (serialized.type === 'string') return serialized.value
    if (serialized.type === 'text') return document.createTextNode(serialized.value)
    if (serialized.type === 'element') {
      const elt = document.createElement('div')
      elt.innerHTML = serialized.value
      const firstChild = elt.firstElementChild
      return firstChild ?? document.createElement('div')
    }
    if (serialized.type === 'nodelist') {
      const elt = document.createElement('div')
      elt.innerHTML = serialized.value
      return elt.childNodes as NodeListOf<Element | Text>
    }
    if (serialized.type === 'array') return serialized.value.map(val => deserialize(val))
    if (serialized.type === 'transformer') return serialized.value
    return Object
      .entries(serialized.value)
      .reduce((reduced, [key, serialized]) => {
      return {
        ...reduced,
        [key]: deserialize(serialized)
      }
    }, {})
  }
}
