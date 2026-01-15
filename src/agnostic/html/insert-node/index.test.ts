import { describe, it, expect, beforeEach } from 'vitest'
import { insertNode } from './index.js'
import { JSDOM } from 'jsdom'
import * as Window from '../../misc/crossenv/window/index.js'

describe('insertNode', () => {
  beforeEach(() => {
    const win = new JSDOM(`<!DOCTYPE html><html><body></body></html>`).window
    Window.set(win)
  })

  it('inserts node before reference node', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const reference = document.createElement('span')
    const node = document.createElement('p')
    parent.appendChild(reference)
    
    insertNode(node, 'before', reference)
    
    expect(parent.childNodes[0]).toBe(node)
    expect(parent.childNodes[1]).toBe(reference)
  })

  it('inserts node after reference node', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const reference = document.createElement('span')
    const node = document.createElement('p')
    parent.appendChild(reference)
    
    insertNode(node, 'after', reference)
    
    expect(parent.childNodes[0]).toBe(reference)
    expect(parent.childNodes[1]).toBe(node)
  })

  it('inserts node at end when inserting after last child', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const reference = document.createElement('span')
    const node = document.createElement('p')
    parent.appendChild(reference)
    
    insertNode(node, 'after', reference)
    
    expect(parent.lastChild).toBe(node)
  })

  it('inserts node as first child with startof', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const existing = document.createElement('span')
    const node = document.createElement('p')
    parent.appendChild(existing)
    
    insertNode(node, 'startof', parent)
    
    expect(parent.firstChild).toBe(node)
    expect(parent.childNodes[1]).toBe(existing)
  })

  it('inserts node as last child with endof', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const existing = document.createElement('span')
    const node = document.createElement('p')
    parent.appendChild(existing)
    
    insertNode(node, 'endof', parent)
    
    expect(parent.lastChild).toBe(node)
    expect(parent.firstChild).toBe(existing)
  })

  it('inserts node in empty parent with startof', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const node = document.createElement('p')
    
    insertNode(node, 'startof', parent)
    
    expect(parent.firstChild).toBe(node)
    expect(parent.lastChild).toBe(node)
  })

  it('inserts node in empty parent with endof', () => {
    const { document } = Window.get()
    const parent = document.createElement('div')
    const node = document.createElement('p')
    
    insertNode(node, 'endof', parent)
    
    expect(parent.firstChild).toBe(node)
    expect(parent.lastChild).toBe(node)
  })
})
