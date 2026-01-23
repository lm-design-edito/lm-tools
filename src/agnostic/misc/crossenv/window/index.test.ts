import { describe, it, expect } from 'vitest'
import * as Window from './index.js'
import { JSDOM } from 'jsdom'

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`)

describe('window', () => {
  it('does not have a global window in nodejs', () => {
    expect(Window.exists()).toBe(false)
  })
  it('throws when getting before window obj has been set', () => {
    expect(Window.get).toThrow()
  })
  it('does not throw when getting a window obj after having set one', () => {
    Window.set(dom.window)
    expect(Window.get).not.toThrow()
    Window.set(2 as any)
    expect(Window.get()).toBe(2)
  })
  it('unsets the window correctly', () => {
    Window.set(dom.window)
    Window.unset()
    expect(Window.get).toThrow()
  })
})
