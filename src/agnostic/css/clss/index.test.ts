import { describe, it, expect } from 'vitest'
import { clss } from './index.js'

describe('clss', () => {
  it ('returns a function', () => {
    expect(typeof clss('comp')).toBe('function')
  })

  it ('accepts `null` for an element name', () => {
    expect(clss('comp')(null)).toEqual('comp')
    expect(clss('comp')([null])).toEqual('comp')
  })

  it ('accepts multiple block names', () => {
    expect(clss(['comp-1', 'comp-2'])(null)).toEqual('comp-1 comp-2')
  })
  
  
  
  // it('returns a color from the niceColors array', () => {
  //   const gen = clss(['comp', 'comp-2'], {
  //     cssModule: {
  //       root: 'module-comp',
  //       elt: 'module-elt',
  //       // 'root--mod': 'module-comp--mod'
  //     },
  //     cssModuleRoot: 'root'
  //   })

  //   console.log('-------------')
  //   console.log(gen(null))
  //   console.log(gen([null]))
  //   console.log(gen('elt'))
  //   console.log(gen(['elt']))
  //   console.log('-------------')
  //   console.log(gen(null, 'mod'))
  //   console.log(gen(null, ['mod1', 'mod2']))
  //   console.log('-------------')
  // })
})
