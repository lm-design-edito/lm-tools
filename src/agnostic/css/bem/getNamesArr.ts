import { isValidClassName } from '../is-valid-css-class-name/index.js'
import { isFalsy } from '../../booleans/is-falsy/index.js'

function getNamesArr (arg: any): string[] {
  const returned: string[] = []
  if (typeof arg === 'string') {
    arg.trim().split(/\s+/gm).forEach(name => { if (isValidClassName(name)) returned.push(name) })
  } else if (Array.isArray(arg)) {
    arg.forEach(elt => returned.push(...getNamesArr(elt)))
  } else if (typeof arg === 'object' && arg !== null) {
    Object.entries(arg).forEach(([key, val]) => {
      if (!isFalsy(val)) returned.push(...getNamesArr(key))
    })
  }
  return returned
}

export default getNamesArr
