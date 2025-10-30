import { Types } from '../types/index.js'

declare var Deno: any
declare var AWS: any

export function detectRuntime (): Types.RuntimeName | null {
  /* Node.js */
  if (typeof process !== 'undefined'
    && typeof process.versions !== 'undefined'
    && typeof process.versions.node !== 'undefined') return Types.RuntimeName.NODE
  /* Browser */
  if (typeof window !== 'undefined'
    && typeof window.document !== 'undefined') return Types.RuntimeName.BROWSER
  /* Deno */
  if (typeof Deno !== 'undefined') return Types.RuntimeName.DENO
  /* React Native */
  if (typeof process !== 'undefined' &&
    typeof navigator.userAgent === 'string'
    && /ReactNative/.test(navigator.userAgent)) return Types.RuntimeName.REACT_NATIVE
  /* Electron */
  if (typeof process !== 'undefined'
    && typeof process.versions !== 'undefined'
    && typeof (process.version as any).electron !== 'undefined') return Types.RuntimeName.ELECTRON
  /* Cloudflare Workers */
  if (typeof self !== 'undefined'
    && typeof self.addEventListener === 'function'
    && typeof Headers !== 'undefined') return Types.RuntimeName.CLOUDFLARE
  /* AWS Lambda */ 
  if (typeof AWS !== 'undefined'
    && typeof AWS.Lambda !== 'undefined') return Types.RuntimeName.AWS_LAMBDA
  /* Other */
  return null
}
