/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { RuntimeName } from '../types.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let Deno: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let AWS: any

/**
 * Detects the current JavaScript runtime environment.
 *
 * Checks for Node.js, Browser, Deno, React Native, Electron,
 * Cloudflare Workers, and AWS Lambda.
 *
 * @returns
 * - The detected runtime as a `RuntimeName` enum value.
 * - `null` if the runtime cannot be determined.
 */
export function detectRuntime (): RuntimeName | null {
  /* Node.js */
  if (process?.versions?.node !== undefined) return RuntimeName.NODE

  /* Browser */
  if (window?.document !== undefined) return RuntimeName.BROWSER

  /* Deno */
  if (Deno !== undefined) return RuntimeName.DENO

  /* React Native */
  if (process !== undefined
    && typeof navigator.userAgent === 'string'
    && navigator.userAgent.includes('ReactNative')
  ) return RuntimeName.REACT_NATIVE

  /* Electron */
  if (process?.versions?.electron !== undefined) return RuntimeName.ELECTRON

  /* Cloudflare Workers */
  if (self !== undefined
    && typeof self.addEventListener === 'function'
    && Headers !== undefined
  ) return RuntimeName.CLOUDFLARE

  /* AWS Lambda */
  if (AWS !== undefined) return RuntimeName.AWS_LAMBDA

  /* Other */
  return null
}
