import * as Window from '../../../misc/crossenv/window/index.js'
import type { Types } from '../types/index.js'
import { Transformer } from '../transformer/index.js'
import { Method } from '../method/index.js'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Serialize {
  export function serialize (value: Types.Tree.Value): Types.Tree.Serialized {
    const { Text, Element, NodeList } = Window.get()
    if (value === null) return { type: 'null', value: null }
    if (typeof value === 'boolean') return { type: 'boolean', value }
    if (typeof value === 'number') return { type: 'number', value }
    if (typeof value === 'string') return { type: 'string', value }
    if (value instanceof Text) return { type: 'text', value: value.textContent }
    if (value instanceof Element) return { type: 'element', value: value.outerHTML }
    if (value instanceof NodeList) return {
      type: 'nodelist',
      value: Array.from(value).map(serialize)
    }
    if (Array.isArray(value)) return { type: 'array', value: value.map(serialize) }
    if (value instanceof Transformer) return { type: 'transformer', value: Transformer.clone(value) }
    if (value instanceof Method) return { type: 'method', value: Method.clone(value) }
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

  export function deserialize (serialized: Types.Tree.Serialized): Types.Tree.Value {
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
      const frag = document.createDocumentFragment()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- filtered to only 'text'/'element' entries just below
      const deserialized = serialized.value
        .filter(e => e.type === 'text' || e.type === 'element')
        .map(deserialize) as Array<Element | Text>
      deserialized.forEach(elt => frag.append(elt.cloneNode(true)))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- frag only received Element/Text clones appended above
      return frag.childNodes as NodeListOf<Element | Text>
    }
    if (serialized.type === 'array') {
      const toRet: Types.Tree.RestingArrayValue = []
      for (const val of serialized.value) {
        const deserialized = deserialize(val)
        if (deserialized instanceof Transformer) continue
        toRet.push(deserialized)
      }
      return toRet
    }
    if (serialized.type === 'transformer') return Transformer.clone(serialized.value)
    if (serialized.type === 'method') return Method.clone(serialized.value)
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
