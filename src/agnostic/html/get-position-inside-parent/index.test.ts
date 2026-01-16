import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import * as Window from '../../misc/crossenv/window/index.js'
import { getPositionInsideParent } from './index.js'

describe('getPositionInsideParent', () => {
  beforeEach(() => Window.set(new JSDOM().window))
  afterEach(() => Window.unset())

  it('returns 0 for first child', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const firstChild = document.createElement('span')
    parent.appendChild(firstChild)
    
    expect(getPositionInsideParent(firstChild)).toBe(0)
  })

  it('returns correct index for middle child', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const child1 = document.createElement('span')
    const child2 = document.createElement('span')
    const child3 = document.createElement('span')
    parent.appendChild(child1)
    parent.appendChild(child2)
    parent.appendChild(child3)
    
    expect(getPositionInsideParent(child2)).toBe(1)
    expect(getPositionInsideParent(child3)).toBe(2)
  })

  it('returns null for node without parent', () => {
    const { document } = Window.get()
    const orphan = document.createElement('div')
    expect(getPositionInsideParent(orphan)).toBe(null)
  })

  it('counts text nodes in position', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const text1 = document.createTextNode('text1')
    const element = document.createElement('span')
    const text2 = document.createTextNode('text2')
    parent.appendChild(text1)
    parent.appendChild(element)
    parent.appendChild(text2)
    
    expect(getPositionInsideParent(element)).toBe(1)
  })

  it('returns correct position after node removal', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const child1 = document.createElement('span')
    const child2 = document.createElement('span')
    const child3 = document.createElement('span')
    parent.appendChild(child1)
    parent.appendChild(child2)
    parent.appendChild(child3)
    
    parent.removeChild(child1)
    expect(getPositionInsideParent(child2)).toBe(0)
    expect(getPositionInsideParent(child3)).toBe(1)
  })
})
