import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { selectorToElement } from './index.js'
import * as Window from '../../misc/crossenv/window/index.js'

describe('selectorToElement', () => {
  beforeEach(() => Window.set(new JSDOM().window))
  afterEach(() => Window.unset())

  it('creates element with tag name', () => {
    const element = selectorToElement('div')
    expect(element.tagName).toBe('DIV')
  })

  it('defaults to div when no tag specified', () => {
    const element = selectorToElement('#myId')
    expect(element.tagName).toBe('DIV')
  })

  it('creates element with ID', () => {
    const element = selectorToElement('#myId')
    expect(element.id).toBe('myId')
  })

  it('creates element with single class', () => {
    const element = selectorToElement('.myClass')
    expect(element.classList.contains('myClass')).toBe(true)
  })

  it('creates element with multiple classes', () => {
    const element = selectorToElement('.class1.class2.class3')
    expect(element.classList.contains('class1')).toBe(true)
    expect(element.classList.contains('class2')).toBe(true)
    expect(element.classList.contains('class3')).toBe(true)
  })

  it('creates element with attribute', () => {
    const element = selectorToElement('[data-test]')
    expect(element.hasAttribute('data-test')).toBe(true)
  })

  it('creates element with attribute and value', () => {
    const element = selectorToElement('[data-test="value"]')
    expect(element.getAttribute('data-test')).toBe('value')
  })

  it('combines tag, ID, classes, and attributes', () => {
    const element = selectorToElement('span#myId.class1.class2[data-test="value"]')
    expect(element.tagName).toBe('SPAN')
    expect(element.id).toBe('myId')
    expect(element.classList.contains('class1')).toBe(true)
    expect(element.classList.contains('class2')).toBe(true)
    expect(element.getAttribute('data-test')).toBe('value')
  })

  it('handles different tag names', () => {
    expect(selectorToElement('span').tagName).toBe('SPAN')
    expect(selectorToElement('p').tagName).toBe('P')
    expect(selectorToElement('button').tagName).toBe('BUTTON')
  })

  it('handles ID with hyphens', () => {
    const element = selectorToElement('#my-id')
    expect(element.id).toBe('my-id')
  })

  it('handles classes with hyphens', () => {
    const element = selectorToElement('.my-class')
    expect(element.classList.contains('my-class')).toBe(true)
  })

  it('handles multiple attributes', () => {
    const element = selectorToElement('[attr1="value1"][attr2="value2"]')
    expect(element.getAttribute('attr1')).toBe('value1')
    expect(element.getAttribute('attr2')).toBe('value2')
  })

  it('handles attribute without value', () => {
    const element = selectorToElement('[disabled]')
    expect(element.hasAttribute('disabled')).toBe(true)
    expect(element.getAttribute('disabled')).toBe('')
  })
})
