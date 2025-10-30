import { Window } from '../../../misc/crossenv/window/index.js'
import { trimStart, trimEnd } from '../../../strings/trim/index.js'

import { Serialize } from '../serialize/index.js'
import { Transformer } from '../transformer/index.js'
import { Types } from '../types/index.js'
import { Utils } from '../utils/index.js'
import { Cast } from '../cast/index.js'

// Isolated smart tags
import { any } from '../smart-tags/isolated/any/index.js'
import { array } from '../smart-tags/isolated/array/index.js'
import { boolean } from '../smart-tags/isolated/boolean/index.js'
import { element } from '../smart-tags/isolated/element/index.js'
import { get } from '../smart-tags/isolated/get/index.js'
import { global } from '../smart-tags/isolated/global/index.js'
import { guess } from '../smart-tags/isolated/guess/index.js'
import { nodelist } from '../smart-tags/isolated/nodelist/index.js'
import { nullFunc } from '../smart-tags/isolated/null/index.js'
import { number } from '../smart-tags/isolated/number/index.js'
import { record } from '../smart-tags/isolated/record/index.js'
import { ref } from '../smart-tags/isolated/ref/index.js'
import { string } from '../smart-tags/isolated/string/index.js'
import { text } from '../smart-tags/isolated/text/index.js'

// Coalesced smart tags
import { add } from '../smart-tags/coalesced/add/index.js'
import { addclass } from '../smart-tags/coalesced/addclass/index.js'
import { and } from '../smart-tags/coalesced/and/index.js'
import { append } from '../smart-tags/coalesced/append/index.js'
import { at } from '../smart-tags/coalesced/at/index.js'
import { call } from '../smart-tags/coalesced/call/index.js'
import { clone } from '../smart-tags/coalesced/clone/index.js'
import { deleteproperties } from '../smart-tags/coalesced/deleteproperties/index.js'
import { equals } from '../smart-tags/coalesced/equals/index.js'
import { getattribute } from '../smart-tags/coalesced/getattribute/index.js'
import { getproperties } from '../smart-tags/coalesced/getproperties/index.js'
import { getproperty } from '../smart-tags/coalesced/getproperty/index.js'
import { ifFunc } from '../smart-tags/coalesced/if/index.js'
import { initialize } from '../smart-tags/coalesced/initialize/index.js'
import { join } from '../smart-tags/coalesced/join/index.js'
import { length } from '../smart-tags/coalesced/length/index.js'
import { map } from '../smart-tags/coalesced/map/index.js'
import { negate } from '../smart-tags/coalesced/negate/index.js'
import { notrailing } from '../smart-tags/coalesced/notrailing/index.js'
import { or } from '../smart-tags/coalesced/or/index.js'
import { pickrandom } from '../smart-tags/coalesced/pickrandom/index.js'
import { print } from '../smart-tags/coalesced/print/index.js'
import { populate } from '../smart-tags/coalesced/populate/index.js'
import { push } from '../smart-tags/coalesced/push/index.js'
import { pusheach } from '../smart-tags/coalesced/pusheach/index.js'
import { recordtoarray } from '../smart-tags/coalesced/recordtoarray/index.js'
import { removeattribute } from '../smart-tags/coalesced/removeattribute/index.js'
import { removeclass } from '../smart-tags/coalesced/removeclass/index.js'
import { renameproperty } from '../smart-tags/coalesced/renameproperty/index.js'
import { replace } from '../smart-tags/coalesced/replace/index.js'
import { select } from '../smart-tags/coalesced/select/index.js'
import { set } from '../smart-tags/coalesced/set/index.js'
import { setattribute } from '../smart-tags/coalesced/setattribute/index.js'
import { setproperty } from '../smart-tags/coalesced/setproperty/index.js'
import { sorton } from '../smart-tags/coalesced/sorton/index.js'
import { split } from '../smart-tags/coalesced/split/index.js'
import { spread } from '../smart-tags/coalesced/spread/index.js'
import { toarray } from '../smart-tags/coalesced/toarray/index.js'
import { toboolean } from '../smart-tags/coalesced/toboolean/index.js'
import { toelement } from '../smart-tags/coalesced/toelement/index.js'
import { toggleclass } from '../smart-tags/coalesced/toggleclass/index.js'
import { tonodelist } from '../smart-tags/coalesced/tonodelist/index.js'
import { tonull } from '../smart-tags/coalesced/tonull/index.js'
import { tonumber } from '../smart-tags/coalesced/tonumber/index.js'
import { torecord } from '../smart-tags/coalesced/torecord/index.js'
import { toref } from '../smart-tags/coalesced/toref/index.js'
import { tostring } from '../smart-tags/coalesced/tostring/index.js'
import { totext } from '../smart-tags/coalesced/totext/index.js'
import { transformselected } from '../smart-tags/coalesced/transformselected/index.js'
import { trim } from '../smart-tags/coalesced/trim/index.js'

// [WIP] eventually just export the Tree class here
export namespace Tree {
  export class Tree {
    readonly node: Element | Text
    readonly options: Types.Tree.Options
    readonly parent: Tree | null
    readonly parents: Tree[]
    readonly pathFromParent: string | number | null
    readonly root: Tree
    readonly isRoot: boolean
    readonly path: Array<string | number>
    readonly pathString: string
    readonly attributes: ReadonlyArray<Readonly<Attr>> | null
    readonly isMethod: boolean
    readonly tagName: string | null
    readonly smartTagName: string | null
    readonly smartTagsRegister: Map<string, Types.SmartTags.SmartTag<any, any, any>>
    readonly smartTagData: Types.SmartTags.SmartTag | null
    readonly mode: Types.Tree.Mode
    readonly isPreserved: boolean
    readonly isLiteral: boolean
    readonly isolationInitType: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>
    readonly subtrees: ReadonlyMap<string | number, Tree> = new Map()

    static actionAttribute = '_action'
    static keyAttribute = '_key'
    static methodAttribute = '_method'
    static initAttribute = '_init'
    static modeAttribute = '_mode'
    static preserveAttribute = '_preserve'
    static literalAttribute = '_literal'

    static defaultOptions: Types.Tree.Options = {
      globalObject: {},
      logger: null,
      loggerThread: 'hyperjson'
    }

    static from (
      nodes: Element[],
      options: Types.Tree.Options): Tree {
      const merged = Utils.Tree.mergeNodes(nodes)
      return new Tree(merged, null, null, options)
    }

    constructor (
      node: Element | Text,
      parent: null,
      pathFromParent: null,
      options?: Types.Tree.Options)
    constructor (
      node: Element | Text,
      parent: Tree,
      pathFromParent: string | number,
      options?: Types.Tree.Options)
    constructor (
      node: Element | Text,
      parent: Tree | null,
      pathFromParent: string | number | null,
      options?: Types.Tree.Options) {
      const { Element, Text, document } = Window.get()

      // Bounds
      this.resolve = this.resolve.bind(this)
      this.setVariable = this.setVariable.bind(this)
      this.getVariable = this.getVariable.bind(this)
      this.performSafetyChecks = this.performSafetyChecks.bind(this)
      this.computeValue = this.computeValue.bind(this)
      this.enforceEvaluation = this.enforceEvaluation.bind(this)
      this.getCachedValue = this.getCachedValue.bind(this)
      this.setCachedValue = this.setCachedValue.bind(this)
      this.evaluate = this.evaluate.bind(this)
      
      // node
      this.node = node

      // options
      this.options = options ?? Tree.defaultOptions

      // parent, parents, pathFromParent, root, isRoot
      if (parent !== null && pathFromParent !== null) {
        this.isRoot = false
        this.parent = parent
        this.parents = [parent, ...parent.parents]
        this.pathFromParent = pathFromParent
        this.root = this.parent.root
      } else {
        this.isRoot = true
        this.parent = null
        this.parents = []
        this.pathFromParent = null
        this.root = this
      }

      // path, pathString
      this.path = this.isRoot ? [] : [...this.parent!.path, this.pathFromParent!]
      this.pathString = `/${this.path.join('/')}`

      // attributes
      this.attributes = node instanceof Element
        ? Array.from(node.attributes)
        : null

      // isMethod, tagName, smartTagName
      if (node instanceof Element) {
        const rawTagName = node.tagName.trim().toLowerCase()
        const hasTrailingUnderscore = rawTagName.endsWith('_')
        const hasMethodAttribute = this.attributes?.find(attr => attr.name === Tree.methodAttribute) !== undefined
        const isMethod = hasTrailingUnderscore || hasMethodAttribute
        this.isMethod = isMethod
        this.tagName = rawTagName
        this.smartTagName = hasTrailingUnderscore 
          ? rawTagName.replace(/_+$/g, '')
          : rawTagName
      } else {
        this.isMethod = false
        this.tagName = null
        this.smartTagName = null
      }

      // smartTagsRegister
      this.smartTagsRegister = new Map<string, Types.SmartTags.SmartTag<any, any, any>>([
        any, array, boolean, element, get, global, guess, nodelist, nullFunc, number, record, ref, string, text, add, addclass,
        and, append, at, call, clone, deleteproperties, equals, getattribute, getproperties, getproperty, ifFunc,
        initialize, join, length, map, negate, notrailing, or, pickrandom, print, populate, push, pusheach,
        recordtoarray, removeattribute, removeclass, renameproperty, replace, select, set, setattribute, spread,
        setproperty, sorton, split, toarray, toboolean, toelement, toggleclass, tonodelist, tonull, tonumber, toref,
        torecord, tostring, totext, transformselected, trim
      ])

      // smartTagData
      if (this.smartTagName === null) { this.smartTagData = null }
      else { this.smartTagData = this.smartTagsRegister.get(this.smartTagName) ?? null }

      // mode
      const hasModeAttribute = this.attributes?.find(attr => {
        return attr.name === Tree.modeAttribute
          && Utils.Tree.TypeChecks.isTreeMode(attr.value)
      })
      this.mode = (hasModeAttribute?.value as Types.Tree.Mode | undefined)
        ?? this.smartTagData?.defaultMode
        ?? 'isolation'

      // isLiteral, isPreserved
      const hasLiteralAttribute = this.attributes?.find(attr => attr.name === Tree.literalAttribute) !== undefined
      this.isLiteral = hasLiteralAttribute
      const hasPreservedAttribute = this.attributes?.find(attr => attr.name === Tree.preserveAttribute) !== undefined
      this.isPreserved = hasPreservedAttribute

      // isolationInitType
      const hasInitAttribute = this.attributes?.find(attr => {
        if (attr.name !== Tree.initAttribute) return false
        const val = attr.value.trim().toLowerCase()
        if (!Utils.Tree.TypeChecks.isValueTypeName(val)) return false
        if (val === 'transformer') return false
        if (val === 'method') return false
        return true
      })
      if (this.mode === 'coalescion') { this.isolationInitType = 'array' }
      else {
        const initAttributeValue = hasInitAttribute?.value as Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'> | undefined
        if (initAttributeValue !== undefined) { this.isolationInitType = initAttributeValue }
        else if (this.smartTagData !== null) { this.isolationInitType = this.smartTagData?.isolationInitType ?? 'array' }
        else { this.isolationInitType = 'nodelist' }
      }

      // subtrees
      const { childNodes } = node
      let positionnedChildrenCount = 0
      const mutableSubtrees = new Map<string | number, Tree>()
      Array
        .from(childNodes)
        // Filter out non Text or Element children
        .filter((child, _, childNodes): child is Element | Text => {
          if (child instanceof Element) return true
          if (child instanceof Text) return true
          return false
        })
        // Merge neighboring Text nodes
        .reduce((reduced, child) => {
          if (reduced.length === 0) return [child]
          if (child instanceof Element) return [...reduced, child]
          const lastReducedItem = reduced[reduced.length - 1]!
          if (lastReducedItem instanceof Element) return [...reduced, child]
          const lastReducedTrimmed = trimEnd(lastReducedItem.textContent ?? '')
          const childTrimmed = trimStart(child.textContent ?? '')
          const merged = document.createTextNode(`${lastReducedTrimmed}${childTrimmed}`)
          const returned = [...reduced]
          returned.pop()
          returned.push(merged)
          return returned
        }, [] as Array<Element | Text>)
        // Filter out empty Text nodes after merging neighbours
        .filter(child => {
          if (child instanceof Element) return true
          const textContent = child.textContent ?? ''
          return textContent.trim() !== ''
        })
        .forEach(childNode => {
          if (childNode instanceof Text) {
            const rawTextContent = childNode.textContent ?? ''
            // Strips padding whitespaces (before and after)
            // if they contain at least one line return character
            const textContent = rawTextContent
              .replace(/^\s*\n+\s*/, '')
              .replace(/\s*\n+\s*$/, '')
            const returnedChildNode = document.createTextNode(textContent)
            mutableSubtrees.set(
              positionnedChildrenCount,
              new Tree(returnedChildNode, this, positionnedChildrenCount, this.options)
            )
            positionnedChildrenCount += 1
          } else {
            const propertyName = childNode.getAttribute(Tree.keyAttribute)
            if (propertyName === null) {
              mutableSubtrees.set(
                positionnedChildrenCount,
                new Tree(childNode, this, positionnedChildrenCount, this.options)
              )
              positionnedChildrenCount += 1
            } else {
              mutableSubtrees.set(
                propertyName,
                new Tree(childNode, this, propertyName, this.options)
              )
            }
          }
        })
      this.subtrees = mutableSubtrees
    }

    resolve: Types.Tree.Resolver = function (this: Tree, path): Tree | undefined {
      let currentTree: Tree = this
      for (const chunk of path) {
        if (chunk === '.') continue
        if (chunk === '..') {
          currentTree = currentTree.parent ?? this
          continue
        }
        const { subtrees } = currentTree
        const foundSubtree = subtrees.get(chunk)
        if (foundSubtree === undefined) return undefined
        currentTree = foundSubtree
      }
      return currentTree
    }

    // [WIP] variablesStore is actually only used on root Tree
    variablesStore = new Map<string, Types.Tree.Serialized>()

    setVariable (name: string, value: Types.Tree.RestingValue): void {
      const { root, isRoot, variablesStore } = this
      if (!isRoot) return root.setVariable(name, value)
      variablesStore.set(name, Serialize.serialize(value))
    }

    getVariable (name: string): Types.Tree.RestingValue | undefined {
      const { root } = this
      const found = root.variablesStore.get(name)
      if (found === undefined) return undefined
      const deserialized = Serialize.deserialize(found)
      if (deserialized instanceof Transformer) throw 'A transformer should not be stored as a variable, this happening denotes an implementation error.'
      return deserialized
    }

    private performSafetyChecks () {
      const { node, smartTagData, isMethod, mode, isRoot } = this
      const { Text } = Window.get()

      // Checks for impossible configurations
      if (node instanceof Text || smartTagData === null) {
        if (isMethod) throw new Error(`A Text or HTMLElement node cannot be used as a method @ ${this.pathString}`)
        if (mode === 'coalescion') throw new Error(`A Text or HTMLElement node cannot be used in coalescion mode @ ${this.pathString}`)
      }

      if (isRoot && mode === 'coalescion') throw new Error(`The root node cannot be used in coalescion mode @ ${this.pathString}`)
    }

    private computeValue (): Types.Tree.Value {
      const {
        isolationInitType,
        subtrees,
        node,
        smartTagData,
        isMethod,
        mode,
        performSafetyChecks,
      } = this
      
      // Looks for impossible attributes configurations
      performSafetyChecks()

      // If node is text, returns the node itself
      const { Text } = Window.get()
      if (node instanceof Text) return node.cloneNode(true) as Text

      // Inner value calculation
      const initialInnerValue = Utils.Tree.getInitialValueFromTypeName(isolationInitType)
      const innerValue = Array
        .from(subtrees)
        .reduce((reduced, [subpath, subtree]) => {
          const subvalue = subtree.evaluate()
          const coalesced = Utils.coalesceValues(reduced, subpath, subvalue)
          return coalesced
        }, initialInnerValue)

      // If no smartTagData, then treat it as an HTMLElement
      if (smartTagData === null) {
        const nodelist = Cast.toNodeList(innerValue)
        const clone = node.cloneNode() as Element
        clone.append(...Array.from(nodelist))
        return clone
      }

      // If node is a SmartTag
      const { transformer, method } = smartTagData.generator(innerValue, mode, this)
      if (isMethod) return method
      if (mode === 'isolation') {
        const applied = transformer.apply(null) // null ignored by apply since isolation mode
        if (applied.success) return applied.payload
        throw {
          error: 'Transformation error',
          details: applied.error,
          transformer: transformer.name,
          path: this.pathString,
        }
      }
      return transformer
    }

    private enforceEvaluation (): Types.Tree.Value {
      const { isPreserved, node, computeValue, isLiteral, attributes } = this
      const { Element } = Window.get()
      if (isPreserved) return Utils.clone(node)
      const evaluated = computeValue()
      if (!isLiteral) return evaluated
      const asLiteral = Utils.toHyperJson(evaluated)
      if (asLiteral instanceof Element) attributes?.forEach(({ name, value }) => asLiteral.setAttribute(name, value))
      return asLiteral
    }

    private cachedValue: Types.Tree.Serialized | undefined = undefined

    private getCachedValue (): Types.Tree.Value | undefined {
      const { cachedValue } = this
      if (cachedValue === undefined) return undefined
      const deserialized = Serialize.deserialize(cachedValue)
      return deserialized
    }

    private setCachedValue (evaluated: Types.Tree.Value) {
      this.cachedValue = Serialize.serialize(evaluated)
    }

    evaluate () {
      const start = Date.now()
      const {
        getCachedValue,
        setCachedValue,
        enforceEvaluation
      } = this
      const cached = getCachedValue()
      if (cached !== undefined) return cached
      const evaluated = enforceEvaluation()
      setCachedValue(evaluated)
      const end = Date.now()
      const time = end - start
      if (time > 20) console.warn(`${this.pathString} took ${time}ms to evaluate, maybe there's something wrong here`)
      return evaluated
    }
  }
}
