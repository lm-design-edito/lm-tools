import { describe, it, expect } from 'vitest'
import { clss } from './index.js'

describe('clss', () => {
  it('returns a function', () => {
    expect(typeof clss('block')).toBe('function')
  })

  it('accepts `null` for an element name', () => {
    expect(clss('block')(null)).toEqual('block')
    expect(clss('block')([null])).toEqual('block')
  })

  it('accepts multiple block names', () => {
    expect(clss(['block-1', 'block-2'])(null)).toEqual('block-1 block-2')
  })

  it('handles elements correctly', () => {
    expect(clss('block')('elt')).toEqual('block__elt')
    expect(clss('block')(['elt-1', 'elt-2'])).toEqual('block__elt-1 block__elt-2')
    expect(clss('block')([null, 'elt-1', 'elt-2'])).toEqual('block block__elt-1 block__elt-2')
  })

  it('handles modifiers on block correctly', () => {
    expect(clss('block')(null, 'mod')).toEqual('block block--mod')
    expect(clss('block')(null, ['mod-1', 'mod-2'])).toEqual('block block--mod-1 block--mod-2')
    expect(clss('block')(null, {
      'mod-1': true,
      'mod-2': false,
      'mod-3': true
    })).toEqual('block block--mod-1 block--mod-3')
  })

  it('handles modifiers on elements correctly', () => {
    expect(clss('block')('elt', 'mod')).toEqual('block__elt block__elt--mod')
    expect(clss('block')('elt', ['mod-1', 'mod-2'])).toEqual('block__elt block__elt--mod-1 block__elt--mod-2')
    expect(clss('block')('elt', {
      'mod-1': true,
      'mod-2': false,
      'mod-3': true
    })).toEqual('block__elt block__elt--mod-1 block__elt--mod-3')
  })

  it('handles optional css modules', () => {
    expect(clss('block', {
      cssModule: {
        root: 'module-block'
      }
    })(null)).toEqual('block module-block')

    expect(clss('block', {
      cssModule: {
        root: 'module-block',
        elt: 'module-elt',
        'elt--mod': 'module-elt-mod'
      }
    })('elt', 'mod')).toEqual('block__elt module-elt block__elt--mod module-elt-mod')
  })

  it('handles optional css modules alternative root name', () => {
    expect(clss('block', {
      cssModule: {
        'alt-root': 'module-block',
        'elt': 'module-elt'
      },
      cssModuleRoot: 'alt-root'
    })('elt')).toEqual('block__elt module-elt')
  })
})
