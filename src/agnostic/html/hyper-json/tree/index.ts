import { isInEnum } from '~/agnostic/objects/enums/is-in-enum'
import { isRecord } from '~/agnostic/objects/is-record'
import { Cast } from '../cast'
import { Crossenv } from '../crossenv'
import { Serialize } from '../serialize'
import { Transformers } from '../transformers'
import { Types } from '../types'

const getWindow = Crossenv.getWindow
const isElement = (node: Node): node is Element => node.nodeType === getWindow().Node.ELEMENT_NODE
const isText = (node: Node): node is Text => node.nodeType === getWindow().Node.TEXT_NODE

type Resolver = (path: Tree['path']) => Tree | undefined

export class Tree<T extends Element | Text = Element | Text> {
  readonly node: T
  readonly name: string | null
  readonly parent: Tree | null
  readonly root: Tree
  readonly path: ReadonlyArray<string | number>
  readonly pathString: string
  readonly pathFromParent: Tree['path'][number]
  readonly tagName: T extends Element ? Element['tagName'] : null
  readonly attributes: T extends Element ? ReadonlyArray<Readonly<Attr>> : null
  readonly subtrees: ReadonlyMap<string | number, Tree> = new Map()
  readonly children: ReadonlyArray<Tree>
  readonly type: 'element' | 'text' | 'null' | 'number' | 'string' | 'boolean' | 'nodelist' | 'array' | 'record' | 'transformer'

  constructor (node: T)
  constructor (node: T, parent: Tree, pathFromParent: number | string)
  constructor (node: T, parent?: Tree, pathFromParent?: number | string) {

    this.resolve = this.resolve.bind(this)
    this.initValue = this.initValue.bind(this)
    this.mergeValues = this.mergeValues.bind(this)
    this.getInnerValue = this.getInnerValue.bind(this)
    this.wrapInnerValue = this.wrapInnerValue.bind(this)
    this.printEvaluationsCounters = this.printEvaluationsCounters.bind(this)
    this.evaluate = this.evaluate.bind(this)
    this.setCache = this.setCache.bind(this)

    // Node, parent, root
    this.node = node
    this.name = this.node instanceof getWindow().Element ? this.node.getAttribute('_name') : null
    this.parent = parent ?? null
    this.root = this.parent === null ? this : this.parent.root

    // Path, pathString, pathFromParent
    if (this.parent === null) this.path = []
    else if (pathFromParent === undefined) { this.path = [...this.parent.path, 0] }
    else { this.path = [...this.parent.path, pathFromParent] }
    this.pathString = `/${this.path.join('/')}`
    this.pathFromParent = pathFromParent ?? this.name ?? 0 // [WIP] not sure about these fallback values

    // Tagname, attributes
    this.tagName = (node instanceof getWindow().Element ? node.tagName.toLowerCase() : null) as T extends Element ? Element['tagName'] : null
    this.attributes = (isElement(node) ? Array.from(node.attributes) : null) as T extends Element ? Attr[] : null

    // Subtrees
    const { childNodes } = node
    let positionnedChildrenCount = 0
    const mutableSubtrees = new Map<string | number, Tree>()
    Array.from(childNodes).filter((node, _, nodes): node is Element | Text => {
      if (isElement(node)) return true
      if (isText(node)) {
        const hasContent = (node.textContent ?? '').trim() !== ''
        if (hasContent) return true
        if (nodes.some(n => n instanceof getWindow().Element)) return false
        return true
      }
      return false
    }).forEach(childNode => {
      if (childNode instanceof getWindow().Text) {
        mutableSubtrees.set(
          positionnedChildrenCount,
          new Tree(childNode, this, positionnedChildrenCount)
        )
        positionnedChildrenCount += 1
      } else {
        const propertyName = childNode.getAttribute('_name')
        if (propertyName === null) {
          mutableSubtrees.set(
            positionnedChildrenCount,
            new Tree(childNode, this, positionnedChildrenCount)
          )
          positionnedChildrenCount += 1
        } else {
          mutableSubtrees.set(
            propertyName,
            new Tree(childNode, this, propertyName)
          )
        }
      }
    })
    this.subtrees = mutableSubtrees
    
    // Children
    this.children = Array.from(this.subtrees.values())
    
    // Type
    if (this.tagName === null) { this.type = 'text' }
    else if (this.tagName === Types.TyperTagName.NULL) { this.type = 'null' }
    else if (this.tagName === Types.TyperTagName.BOOLEAN) { this.type = 'boolean' }
    else if (this.tagName === Types.TyperTagName.NUMBER) { this.type = 'number' }
    else if (this.tagName === Types.TyperTagName.STRING) { this.type = 'string' }
    else if (this.tagName === Types.TyperTagName.TEXT) { this.type = 'text' }
    else if (this.tagName === Types.TyperTagName.NODELIST) { this.type = 'nodelist' }
    else if (this.tagName === Types.TyperTagName.ARRAY) { this.type = 'array' }
    else if (this.tagName === Types.TyperTagName.RECORD) { this.type = 'record' }
    else if (isInEnum(Types.TransformerTagName, this.tagName as any)) { this.type = 'transformer' }
    else { this.type = 'element' }
  }

  resolve: Resolver = function (this: Tree, path): Tree | undefined {
    let currentTree: Tree = this.root
    for (const chunk of path) {
      const { subtrees } = currentTree
      const foundSubtree = subtrees.get(chunk)
      if (foundSubtree === undefined) return undefined
      currentTree = foundSubtree
    }
    return currentTree
  }

  initValue (this: Tree<T>) {
    const { type } = this
    let currentValue: Types.Value
    if (type === 'null') { currentValue = null }
    else if (type === 'boolean') { currentValue = false }
    else if (type === 'number') { currentValue = 0 }
    else if (type === 'string') { currentValue = '' }
    else if (type === 'text') { currentValue = this.node.textContent }
    else if (type === 'element') { currentValue = getWindow().document.createDocumentFragment().childNodes as NodeListOf<Element | Text> }
    else if (type === 'nodelist') { currentValue = getWindow().document.createDocumentFragment().childNodes as NodeListOf<Element | Text> }
    else if (type === 'array') { currentValue = [] }
    else if (type === 'record') { currentValue = {} }
    else if (type === 'transformer') { currentValue = [] } // WIP assume array since we want to obtain an array of params ?
    else { currentValue = null } // normally type: never here
    return currentValue
  }

  mergeValues (
    currentValue: Types.Value,
    incomingValue: Types.Value,
    mergeKey: string | number
  ): Types.Value {
    
    // [WIP] write something cleaner?
    const { Element, Text, NodeList, document } = getWindow()

    // incoming : transformer
    if (typeof incomingValue === 'function') return incomingValue(currentValue, {
      merger: this.mergeValues,
      resolver: this.resolve
    })

    // currentValue : Array
    if (Array.isArray(currentValue)) {
      if (typeof mergeKey === 'string') return currentValue
      return [...currentValue, incomingValue]
    }

    // currentValue : null, boolean, number, string, Text, Element or transformer
    if (currentValue === null
      || typeof currentValue === 'boolean'
      || typeof currentValue === 'number'
      || typeof currentValue === 'string'
      || typeof currentValue === 'function'
      || currentValue instanceof Text
      || currentValue instanceof Element) {
      
      // incoming : null, boolean, number, string, array, record
      if (incomingValue === null
        || typeof incomingValue === 'boolean'
        || typeof incomingValue === 'number'
        || typeof incomingValue === 'string'
        || Array.isArray(incomingValue)
        || isRecord(incomingValue)) {
        return incomingValue
      }
      // incoming : Element, Text, Nodelist
      const frag = document.createDocumentFragment()
      if (currentValue instanceof Element || currentValue instanceof Text) frag.append(currentValue.cloneNode(true))
      else frag.append(`${currentValue}`)
      if (incomingValue instanceof Element || incomingValue instanceof Text) {
        frag.append(incomingValue.cloneNode(true))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      frag.append(...Array.from(incomingValue).map(e => e.cloneNode(true)))
      return frag.childNodes as NodeListOf<Element | Text>
    }

    // currentValue : NodeList
    if (currentValue instanceof NodeList) {
      // incoming : Element or Text
      if (incomingValue instanceof Element || incomingValue instanceof Text) {
        const frag = document.createDocumentFragment()
        frag.append(...Array.from(currentValue).map(e => e.cloneNode(true)), incomingValue)
        return frag.childNodes as NodeListOf<Element | Text>
      }

      // incoming : NodeList
      if (incomingValue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(
          ...Array.from(currentValue).map(e => e.cloneNode(true)),
          ...Array.from(incomingValue).map(e => e.cloneNode(true))
        )
        return frag.childNodes as NodeListOf<Element | Text>
      }
      
      // incoming : primitive
      if (incomingValue === null
        || typeof incomingValue === 'string'
        || typeof incomingValue === 'number'
        || typeof incomingValue === 'boolean') {
        const frag = document.createDocumentFragment()
        frag.append(...Array.from(currentValue).map(e => e.cloneNode(true)), `${incomingValue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      
      // incoming : Array
      if (Array.isArray(incomingValue)) return [
        ...Array.from(currentValue),
        ...incomingValue
      ]
      
      // incoming : Record
      return { ...incomingValue }
    }

    // currentValue : Record
    if (typeof mergeKey === 'number') return currentValue

    return {
      ...currentValue,
      [mergeKey]: incomingValue
    }
  }

  getInnerValue (this: Tree<T>, initialValue: ReturnType<typeof this.initValue>): Types.Value {
    const { subtrees } = this
    const innerValue = Array
      .from(subtrees.entries())
      .reduce((currentValue, [subpath, subtree]) => this.mergeValues(
        currentValue,
        subtree.evaluate(),
        subpath
      ), initialValue as Types.Value)
    return innerValue
  }

  wrapInnerValue (this: Tree<T>, innerValue: Types.Value): Types.Value | Types.Transformer {
    const { type, pathFromParent } = this
    if (type === 'transformer') {
      const transformerName = this.tagName
      const generator = Transformers.get(transformerName)
      if (generator === undefined) return innerValue
      const transformer = Array.isArray(innerValue)
        ? generator(pathFromParent, ...innerValue)
        : generator(pathFromParent, innerValue)
      return transformer
    }
    if (type === 'null') return Cast.toNull()
    if (type === 'boolean') return Cast.toBoolean(innerValue)
    if (type === 'number') return Cast.toNumber(innerValue)
    if (type === 'string') return Cast.toString(innerValue)
    if (type === 'array') return Cast.toArray(innerValue)
    if (type === 'record') return Cast.toRecord(innerValue)
    if (type === 'text') return Cast.toText(innerValue)
    if (type === 'element') return Cast.toElement(innerValue)
    if (type === 'nodelist') return Cast.toNodeList(innerValue)
    return Cast.toNull()
  }

  private evaluationsCounter = {
    computed: 0,
    cached: 0
  }

  printEvaluationsCounters () {
    const { subtrees, evaluationsCounter } = this
    const { computed, cached } = evaluationsCounter
    console.log(this.pathString, `computed: ${computed}, cached: ${cached}`)
    subtrees.forEach(subtree => subtree.printEvaluationsCounters())
  }

  private cache: Types.Serialized | undefined = undefined
  private setCache (this: Tree, value: Types.Value): void {
    this.cache = Serialize.serialize(value)
  }

  evaluate (this: Tree<T>): Types.Value | Types.Transformer {
    if (this.cache !== undefined) {
      this.evaluationsCounter.cached ++
      return Serialize.deserialize(this.cache)
    }
    const init = this.initValue()
    const inner = this.getInnerValue(init)
    const wrapped = this.wrapInnerValue(inner)
    this.setCache(wrapped)
    this.evaluationsCounter.computed ++
    return wrapped
  }
}
