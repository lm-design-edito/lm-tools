import { Register as RegisterNamespace } from './register/index.js'
import { unknownToString as unknownToStringFunc } from './unknown-to-string/index.js'

export namespace Errors {
  export import Register = RegisterNamespace
  export const unknownToString = unknownToStringFunc
}
