import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { stringToNodes } from './index.js'

import { JSDOM } from 'jsdom'
import * as Window from '../../misc/crossenv/window/index.js'

describe('stringToNodes', () => {
  beforeEach(() => Window.set(new JSDOM().window))
  afterEach(() => Window.unset())

  it('converts simple HTML string to nodes', () => {
    const { Node } = Window.get()
    const result = stringToNodes('<div>test</div>')
    expect(result).toHaveLength(1)
    expect(result[0]?.nodeType).toBe(Node.ELEMENT_NODE)
    expect((result[0] as Element).tagName).toBe('DIV')
  })

  it('converts multiple elements', () => {
    const result = stringToNodes('<div>1</div><span>2</span>')
    expect(result).toHaveLength(2)
    expect((result[0] as Element).tagName).toBe('DIV')
    expect((result[1] as Element).tagName).toBe('SPAN')
  })

  it('includes text nodes', () => {
    const { Node } = Window.get()
    const result = stringToNodes('plain text')
    expect(result).toHaveLength(1)
    expect(result[0]?.nodeType).toBe(Node.TEXT_NODE)
    expect(result[0]?.textContent).toBe('plain text')
  })

  it('includes both element and text nodes', () => {
    const { Node } = Window.get()
    const result = stringToNodes('<div>test</div>more text')
    expect(result.length).toBeGreaterThan(1)
    const hasElement = result.some(node => node.nodeType === Node.ELEMENT_NODE)
    const hasText = result.some(node => node.nodeType === Node.TEXT_NODE)
    expect(hasElement).toBe(true)
    expect(hasText).toBe(true)
  })

  it('filters out comment nodes', () => {
    const { Node } = Window.get()
    const result = stringToNodes('<!-- comment --><div>test</div>')
    const commentNodes = result.filter(node => node.nodeType === Node.COMMENT_NODE)
    expect(commentNodes).toHaveLength(0)
  })

  it('returns empty array for empty string', () => {
    const result = stringToNodes('')
    expect(result).toHaveLength(0)
  })

  it('handles nested elements', () => {
    const result = stringToNodes('<div><span>nested</span></div>')
    expect(result).toHaveLength(1)
    const div = result[0] as Element
    expect(div.children.length).toBe(1)
    expect(div.children[0]?.tagName).toBe('SPAN')
  })
})
