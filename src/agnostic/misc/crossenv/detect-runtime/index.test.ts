import { describe, it, expect, afterEach, vi } from 'vitest'
import { detectRuntime } from './index.js'
import { RuntimeName } from '../types.js'

describe('detectRuntime', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('returns RuntimeName.NODE when nothing more specific is present', () => {
    expect(detectRuntime()).toBe(RuntimeName.NODE)
  })

  it('returns RuntimeName.ELECTRON rather than NODE when process carries an electron version', () => {
    vi.stubGlobal('process', { ...process, versions: { ...process.versions, electron: '30.0.0' } })
    expect(detectRuntime()).toBe(RuntimeName.ELECTRON)
  })

  it('returns RuntimeName.AWS_LAMBDA rather than NODE when the function name is in the environment', () => {
    vi.stubEnv('AWS_LAMBDA_FUNCTION_NAME', 'some-function')
    expect(detectRuntime()).toBe(RuntimeName.AWS_LAMBDA)
  })

  it('returns RuntimeName.DENO rather than NODE, since Deno ships a process shim', () => {
    vi.stubGlobal('Deno', { version: { deno: '2.0.0' } })
    expect(detectRuntime()).toBe(RuntimeName.DENO)
  })

  it('returns RuntimeName.REACT_NATIVE when navigator.product says so', () => {
    vi.stubGlobal('navigator', { product: 'ReactNative', userAgent: '' })
    expect(detectRuntime()).toBe(RuntimeName.REACT_NATIVE)
  })

  it('returns RuntimeName.REACT_NATIVE when only the user agent mentions it', () => {
    vi.stubGlobal('navigator', { product: 'Gecko', userAgent: 'okhttp ReactNative' })
    expect(detectRuntime()).toBe(RuntimeName.REACT_NATIVE)
  })

  it('returns RuntimeName.CLOUDFLARE for the Cloudflare Workers user agent', () => {
    vi.stubGlobal('navigator', { product: 'Gecko', userAgent: 'Cloudflare-Workers' })
    expect(detectRuntime()).toBe(RuntimeName.CLOUDFLARE)
  })

  it('does not throw when process holds no version string', () => {
    vi.stubGlobal('process', {})
    expect(() => detectRuntime()).not.toThrow()
  })

  it('returns null when no marker is present at all', () => {
    vi.stubGlobal('process', {})
    vi.stubGlobal('navigator', undefined)
    vi.stubGlobal('window', undefined)
    expect(detectRuntime()).toBeNull()
  })
})
