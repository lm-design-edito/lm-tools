import { memoize as memoizeFunc } from './memoize/index.js'
import {
  throttle as throttleFunc,
  debounce as debounceFunc
} from './throttle-debounce/index.js'

export namespace Optim {
  // Memoize
  export const memoize = memoizeFunc
  // Throttle-debounce
  export const throttle = throttleFunc
  export const debounce = debounceFunc
}