import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getConnection, getCurrentDownlink } from './index.js'
import * as Window from '../crossenv/window/index.js'
import { JSDOM } from 'jsdom'

describe('getConnection', () => {
  beforeEach(() => Window.set(new JSDOM().window))
  afterEach(() => Window.unset())

  it('returns undefined when navigator is not available', () => {
    const dom = new JSDOM()
    const window = dom.window as any
    Object.defineProperty(window, 'navigator', {
      value: null,
      writable: true,
      configurable: true
    })
    Window.set(window)

    expect(getConnection()).toBeUndefined()
  })

  it('returns undefined when navigator exists but has no connection', () => {
    const dom = new JSDOM()
    const window = dom.window as any
    const navigator = {}
    Object.defineProperty(window, 'navigator', {
      value: navigator,
      writable: true,
      configurable: true
    })
    Window.set(window)

    expect(getConnection()).toBeUndefined()
  })

  it('returns connection when available', () => {
    const dom = new JSDOM()
    const window = dom.window as any
    const connection = {
      downlink: 10,
      type: 'wifi',
      effectiveType: '4g'
    }
    const navigator = {}
    Object.defineProperty(navigator, 'connection', {
      value: connection,
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'navigator', {
      value: navigator,
      writable: true,
      configurable: true
    })
    Window.set(window)
    
    const result = getConnection()
    expect(result).toEqual({
      downlink: 10,
      type: 'wifi',
      effectiveType: '4g'
    })
  })

  it('uses mozConnection as fallback', () => {
    const dom = new JSDOM()
    const window = dom.window as any
    const mozConnection = {
      downlink: 5,
      type: 'cellular',
      effectiveType: '3g'
    }
    const navigator = {}
    Object.defineProperty(navigator, 'mozConnection', {
      value: mozConnection,
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'navigator', {
      value: navigator,
      writable: true,
      configurable: true
    })
    Window.set(window)
    
    const result = getConnection()
    expect(result?.type).toBe('cellular')
  })

  it('uses webkitConnection as fallback', () => {
    const dom = new JSDOM()
    const window = dom.window as any
    const webkitConnection = {
      downlink: 7.5,
      type: 'ethernet',
      effectiveType: '4g'
    }
    const navigator = {}
    Object.defineProperty(navigator, 'webkitConnection', {
      value: webkitConnection,
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'navigator', {
      value: navigator,
      writable: true,
      configurable: true
    })
    Window.set(window)
    
    const result = getConnection()
    expect(result?.type).toBe('ethernet')
  })
})

describe('getCurrentDownlink', () => {
  beforeEach(() => Window.set(new JSDOM().window))
  afterEach(() => Window.unset())

  it('returns downlink when connection is available', () => {
    const dom = new JSDOM()
    const window = dom.window as any
    const connection = {
      downlink: 10,
      type: 'wifi',
      effectiveType: '4g'
    }
    const navigator = {}
    Object.defineProperty(navigator, 'connection', {
      value: connection,
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'navigator', {
      value: navigator,
      writable: true,
      configurable: true
    })
    Window.set(window)
    
    expect(getCurrentDownlink()).toBe(10)
  })

  it('returns undefined when connection is not available', () => {
    const dom = new JSDOM()
    const window = dom.window as any
    const navigator = {}
    Object.defineProperty(window, 'navigator', {
      value: navigator,
      writable: true,
      configurable: true
    })
    Window.set(window)
    
    expect(getCurrentDownlink()).toBeUndefined()
  })
})
