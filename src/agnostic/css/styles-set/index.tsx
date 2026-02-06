import { Component, type JSX } from 'react'
import {
  createRoot as reactCreateRoot,
  type Root as ReactRoot
} from 'react-dom/client'
import { randomHash } from '../../random/uuid/index.js'

// [WIP] no jsdoc here + maybe wrong idea ?
// [WIP] should at least use crossenv window

export type StylesSetItem = {
  type: 'string' | 'url'
  content: string
  id?: string
  position?: number
  onLoad?: () => void
}

export class StylesSet {
  static defaultPrivateIDAttribute = 'data-styleset-private-id'
  static defaultPublicIDAttribute = 'data-styleset-public-id'
  tagsPrivateIDAttribute = StylesSet.defaultPrivateIDAttribute
  tagsPublicIDAttribute = StylesSet.defaultPublicIDAttribute

  private readonly _items = new Map<string, StylesSetItem>()

  get items (): Map<string, StylesSetItem> {
    const sortedItemsArray = Array.from(this._items).map(([privateId, item]) => {
      const targetPosition = this.getTargetPosition(privateId) ?? 0
      return { targetPosition, privateId, item }
    }).sort((a, b) => a.targetPosition - b.targetPosition)
      .map(({ item, privateId }) => ([privateId, item] as [string, StylesSetItem]))
    const sortedItemsMap = new Map(sortedItemsArray)
    return sortedItemsMap
  }

  private getTargetPosition (privateId: string): number | null {
    const orderedStyles = Array.from(this._items)
      .map(([privateId, data]) => ({ privateId, data }))
      .sort((a, b) => {
        const aPos = a.data.position ?? 0
        const bPos = b.data.position ?? 0
        return aPos - bPos
      })
    const foundIndex = orderedStyles.findIndex(item => item.privateId === privateId)
    return foundIndex === -1 ? null : foundIndex
  }

  setTagsPrivateIDAttribute (str: string): this {
    this.tagsPrivateIDAttribute = str
    return this
  }

  setTagsPublicIDAttribute (str: string): this {
    this.tagsPublicIDAttribute = str
    return this
  }

  getById (id: string): StylesSetItem | undefined {
    const found = Array.from(this._items.values())
      .find(entry => entry.id === id)
    if (found === undefined) return undefined
    return found
  }

  generateUniquePrivateId (): string {
    const existingIds = Array.from(this._items.keys())
    const generated = randomHash(12)
    if (existingIds.includes(generated)) return this.generateUniquePrivateId()
    return generated
  }

  private readonly _rendered = new Map<Element, ReactRoot>()

  render (element: Element): this {
    const root = reactCreateRoot(element)
    const items = this.items
    root.render(<StylesSetComp
      items={items}
      privateIDAttribute={this.tagsPrivateIDAttribute}
      publicIDAttribute={this.tagsPublicIDAttribute} />)
    this._rendered.set(element, root)
    return this
  }

  unmount (element: Element): this {
    if (!this._rendered.has(element)) return this
    const root = this._rendered.get(element)
    if (root === undefined) return this
    root.unmount()
    this._rendered.delete(element)
    return this
  }

  updateRendered (): this {
    const { items } = this
    this._rendered.forEach((root) => root.render(<StylesSetComp
      items={items}
      privateIDAttribute={this.tagsPrivateIDAttribute}
      publicIDAttribute={this.tagsPublicIDAttribute} />))
    return this
  }

  addItem (item: StylesSetItem, abortIfIdExists: boolean = true): this {
    const existing = Array
      .from(this._items.entries())
      .map(([privateId, entry]) => ({ privateId, entry }))
      .find(({ entry }) => (entry.id !== undefined && entry.id === item.id))
    if (existing !== undefined) {
      if (abortIfIdExists) return this
      this._items.delete(existing.privateId)
    }
    const privateId = this.generateUniquePrivateId()
    this._items.set(privateId, item)
    this.updateRendered()
    return this
  }

  removeItem (idOrPosition: string | number): this {
    if (typeof idOrPosition === 'string') {
      const existing = Array
        .from(this._items.entries())
        .map(([privateId, entry]) => ({ privateId, entry }))
        .find(({ entry }) => (entry.id !== undefined && entry.id === idOrPosition))
      if (existing === undefined) return this
      this._items.delete(existing.privateId)
      this.updateRendered()
      return this
    }
    const toRemove = Array
      .from(this._items)
      .map(([privateId, entry]) => ({ privateId, entry }))
      .at(idOrPosition)
    if (toRemove === undefined) return this
    this._items.delete(toRemove.privateId)
    this.updateRendered()
    return this
  }

  async getDomString (documentObj?: Document): Promise<string> {
    const actualDocumentObj = documentObj ?? window.document
    if (actualDocumentObj === null) throw new Error('Window.document is not available')
    return await new Promise(resolve => {
      const tempElt = actualDocumentObj.createElement('div')
      const tempRoot = reactCreateRoot(tempElt)
      const { items } = this
      const onRendered = (): void => {
        resolve(tempElt.innerHTML)
        tempRoot.unmount()
        tempElt.remove()
      }
      tempRoot.render(<StylesSetComp
        items={items}
        privateIDAttribute={this.tagsPrivateIDAttribute}
        publicIDAttribute={this.tagsPublicIDAttribute}
        onRendered={onRendered} />)
    })
  }
}

export type StylesSetCompProps = {
  items?: StylesSet['items']
  privateIDAttribute?: StylesSet['tagsPrivateIDAttribute']
  publicIDAttribute?: StylesSet['tagsPublicIDAttribute']
  onRendered?: (...any: any[]) => any
}

export class StylesSetComp extends Component<StylesSetCompProps> {
  componentDidMount (): void {
    const { props } = this
    const { onRendered } = props
    if (onRendered !== undefined) onRendered()
  }

  componentDidUpdate (): void {
    const { props } = this
    const { onRendered } = props
    if (onRendered !== undefined) onRendered()
  }

  render (): JSX.Element {
    const { props } = this
    const items: StylesSet['items'] = props.items ?? new Map()
    const pidAttr = props.privateIDAttribute ?? StylesSet.defaultPrivateIDAttribute
    const idAttr = props.publicIDAttribute ?? StylesSet.defaultPublicIDAttribute
    return <>{Array.from(items).map(([privateId, itemData]) => {
      const customAttributes = { [pidAttr]: privateId, [idAttr]: itemData.id }
      if (itemData.type === 'url') return <link
        onLoad={itemData.onLoad}
        rel='stylesheet'
        href={itemData.content}
        {...customAttributes} />
      return <style {...customAttributes}>
        {itemData.content}
      </style>
    })}</>
  }
}
