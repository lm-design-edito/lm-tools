import {
  random as randomFunc,
  randomInt as randomIntFunc
} from './random/index.js'
import {
  hexChars as hexCharsObj,
  randomHexChar as randomHexCharFunc
} from './hex-char/index.js'
import {
  randomHash as randomHashFunc,
  randomHashPattern as randomHashPatternFunc,
  randomUUID as randomUUIDFunc
} from './uuid/index.js'

export namespace Random {
  export const random = randomFunc
  export const randomInt = randomIntFunc
  export const hexChars = hexCharsObj
  export const randomHexChar = randomHexCharFunc
  export const randomHash = randomHashFunc
  export const randomHashPattern = randomHashPatternFunc
  export const randomUUID = randomUUIDFunc
}
