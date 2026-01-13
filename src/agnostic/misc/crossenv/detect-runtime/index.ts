import { RuntimeName } from '../types/index.js'

declare var Deno: any
declare var AWS: any

/**
 * Detects the current JavaScript runtime environment.
 *
 * Checks for Node.js, Browser, Deno, React Native, Electron,
 * Cloudflare Workers, and AWS Lambda.
 *
 * @returns {RuntimeName | null}
 * - The detected runtime as a `RuntimeName` enum value.
 * - `null` if the runtime cannot be determined.
 */
export function detectRuntime (): RuntimeName | null {
  
  /* Node.js */
  if (typeof process !== 'undefined'
    && typeof process.versions !== 'undefined'
    && typeof process.versions.node !== 'undefined'
  ) return RuntimeName.NODE
  
  /* Browser */
  if (typeof window !== 'undefined'
    && typeof window.document !== 'undefined'
  ) return RuntimeName.BROWSER
  
  /* Deno */
  if (typeof Deno !== 'undefined') return RuntimeName.DENO
  
  /* React Native */
  if (typeof process !== 'undefined' &&
    typeof navigator.userAgent === 'string'
    && /ReactNative/.test(navigator.userAgent)
  ) return RuntimeName.REACT_NATIVE
  
  /* Electron */
  if (typeof process !== 'undefined'
    && typeof process.versions !== 'undefined'
    && typeof (process.version as any).electron !== 'undefined'
  ) return RuntimeName.ELECTRON
  
  /* Cloudflare Workers */
  if (typeof self !== 'undefined'
    && typeof self.addEventListener === 'function'
    && typeof Headers !== 'undefined'
  ) return RuntimeName.CLOUDFLARE
  
  /* AWS Lambda */ 
  if (typeof AWS !== 'undefined'
    && typeof AWS.Lambda !== 'undefined'
  ) return RuntimeName.AWS_LAMBDA
  
  /* Other */
  return null
}
