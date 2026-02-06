import { describe, it, expect, vi } from 'vitest'
import { sanitizeUserInput } from './index.js'

vi.mock('xss', () => ({
  default: vi.fn((value: string) => `sanitized(${value})`)
}))

describe('sanitizeUserInput', () => {
  it('sanitizes plain strings using xss', () => {
    const result = sanitizeUserInput('<script>alert(1)</script>')
    expect(result).toBe('sanitized(<script>alert(1)</script>)')
  })

  it('recursively sanitizes arrays and objects', () => {
    const input = {
      '<key>': ['<v1>', '<v2>'],
      nested: { '<inner>': '<v3>' }
    }
    const result = sanitizeUserInput(input)
    expect(result).toEqual({
      'sanitized(<key>)': ['sanitized(<v1>)', 'sanitized(<v2>)'],
      'sanitized(nested)': { 'sanitized(<inner>)': 'sanitized(<v3>)' }
    })
  })

  it('handles circular references without infinite recursion', () => {
    const obj: any = { name: '<name>' }
    obj.self = obj
    const result = sanitizeUserInput(obj)
    // Just verify it doesn't throw and returns something
    expect(result).toBeDefined()
    // The circular reference should still be circular
    expect(result['sanitized(self)']).toBe(result)
  })
})
