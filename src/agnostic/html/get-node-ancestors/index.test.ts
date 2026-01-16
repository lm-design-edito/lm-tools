import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { getNodeAncestors } from './index.js'
import * as Window from '../../misc/crossenv/window/index.js'

describe('getNodeAncestors', () => {
  beforeEach(() => Window.set(new JSDOM('', { url: 'http://localhost/' }).window))
  afterEach(() => Window.unset())

  it('returns the node itself as first element', () => {
    const { document } = Window.get()
    const div = document.createElement('div')
    const result = getNodeAncestors(div)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(div)
  })

  it('returns all ancestors including the node', () => {
    const { document } = Window.get()
    const grandparent = document.createElement('div')
    const parent = document.createElement('div')
    const child = document.createElement('div')
    grandparent.appendChild(parent)
    parent.appendChild(child)
    
    const result = getNodeAncestors(child)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe(child)
    expect(result[1]).toBe(parent)
    expect(result[2]).toBe(grandparent)
  })

  it('stops at document.documentElement', () => {
    const { document } = Window.get()
    const div = document.createElement('div')
    document.body.appendChild(div)
    
    const result = getNodeAncestors(div)
    expect(result.length).toBeGreaterThan(1)
    expect(result.at(-1)).toBe(document.documentElement)
  })

  it('does not traverse shadow roots by default', () => {
    const { document } = Window.get()
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const shadowChild = document.createElement('span')
    shadowRoot.appendChild(shadowChild)
    
    const result = getNodeAncestors(shadowChild)
    expect(result).toContain(shadowChild)
    expect(result).toContain(shadowRoot)
    expect(result).not.toContain(host)
  })

  it('traverses shadow roots when traverseShadowRoots is true', () => {
    const { document } = Window.get()
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const shadowChild = document.createElement('span')
    shadowRoot.appendChild(shadowChild)
    
    const result = getNodeAncestors(shadowChild, true)
    expect(result).toContain(shadowChild)
    expect(result).toContain(shadowRoot)
    expect(result).toContain(host)
  })
})
