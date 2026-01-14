import { describe, it, expect } from 'vitest'
import { exists, set, get, unset } from './index.js'
import { JSDOM } from 'jsdom'

describe('crossenv/window', () => {
  it('detects window and allows set/get/unset', () => {
    // create a DOM window for the test
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    set(dom.window as any)
    expect(exists()).toBe(true)  // now it will return true
    const fake = { foo: 1 } as any
    set(fake)
    expect(get()).toBe(fake)
    unset()
  })
})
