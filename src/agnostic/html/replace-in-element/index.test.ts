import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { replaceInElement } from './index.js'
import * as Window from '../../misc/crossenv/window/index.js'

describe('replaceInElement', () => {
  beforeEach(() => Window.set(new JSDOM().window))
  afterEach(() => Window.unset())

  it('replaces a single node with another node', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const toReplace = document.createElement('span')
    const replacement = document.createElement('p')
    parent.appendChild(toReplace)

    const replaceMap = new Map([[toReplace, replacement]])
    replaceInElement(parent, replaceMap)

    expect(parent.childNodes.length).toBe(1)
    expect(parent.firstChild).toBe(replacement)
    expect(parent.contains(toReplace)).toBe(false)
  })

  it('replaces multiple nodes', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const node1 = document.createElement('span')
    const node2 = document.createElement('span')
    const replacement1 = document.createElement('p')
    const replacement2 = document.createElement('div')
    parent.appendChild(node1)
    parent.appendChild(node2)

    const replaceMap = new Map([
      [node1, replacement1],
      [node2, replacement2]
    ])
    replaceInElement(parent, replaceMap)

    expect(parent.childNodes.length).toBe(2)
    expect(parent.childNodes[0]).toBe(replacement1)
    expect(parent.childNodes[1]).toBe(replacement2)
  })

  it('replaces node with multiple nodes', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const toReplace = document.createElement('span')
    const replacement1 = document.createElement('p')
    const replacement2 = document.createElement('div')
    parent.appendChild(toReplace)

    const fragment = document.createDocumentFragment()
    fragment.appendChild(replacement1)
    fragment.appendChild(replacement2)
    const nodeList = fragment.childNodes

    const replaceMap = new Map([[toReplace, nodeList]])
    replaceInElement(parent, replaceMap)

    expect(parent.childNodes.length).toBe(2)
    expect(parent.childNodes[0]).toBe(replacement1)
    expect(parent.childNodes[1]).toBe(replacement2)
  })

  it('only replaces nodes that are descendants', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const child = document.createElement('span')
    const orphan = document.createElement('span')
    const replacement = document.createElement('p')
    parent.appendChild(child)

    const replaceMap = new Map([
      [child, replacement],
      [orphan, document.createElement('div')]
    ])
    replaceInElement(parent, replaceMap)

    expect(parent.contains(replacement)).toBe(true)
    expect(parent.contains(orphan)).toBe(false)
  })

  it('returns the input element', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const child = document.createElement('span')
    const replacement = document.createElement('p')
    parent.appendChild(child)

    const replaceMap = new Map([[child, replacement]])
    const result = replaceInElement(parent, replaceMap)

    expect(result).toBe(parent)
  })
})
