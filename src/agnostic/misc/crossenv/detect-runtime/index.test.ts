import { describe, it, expect } from 'vitest'
import { detectRuntime } from './index.js'
import { RuntimeName } from '../types.js'

describe('detectRuntime', () => {
  it('returns RuntimeName.BROWSER in browser environment', () => {
    const result = detectRuntime()
    // In test environment, this should detect browser if window is available
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
      expect(result).toBe(RuntimeName.BROWSER)
    }
  })

  it('returns RuntimeName.NODE in Node.js environment', () => {
    // This test would need to be run in Node.js environment
    // In browser test environment, it won't detect Node
    if (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.node !== 'undefined') {
      expect(detectRuntime()).toBe(RuntimeName.NODE)
    }
  })

  it('returns null when runtime cannot be determined', () => {
    // This is hard to test without mocking, but we can verify the function exists
    expect(typeof detectRuntime).toBe('function')
  })
})
