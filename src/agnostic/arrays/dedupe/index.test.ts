import { describe, it, expect } from 'vitest'
import { dedupe } from './index.js'

describe('dedupe', () => {
  it('preserves arrays without duplicates', () => {
    const result = dedupe([1, 2, 3])
    expect(result).toHaveLength(3)
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).toContain(3)
  })
  it('removes duplicates', () => {
    const dupObj = { b: 1 }
    const result = dedupe([
      1, 1, 2,
      'a', 'a', 'b',
      true, true, false,
      null, null,
      undefined, undefined,
      { a: 1 }, { a: 1 },
      dupObj, dupObj
    ])
    expect(JSON.stringify(result)).toEqual('[1,2,"a","b",true,false,null,null,{"a":1},{"a":1},{"b":1}]')
  })
})
