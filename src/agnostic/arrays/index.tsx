import { findDuplicates as findDuplicatesFunc } from './find-duplicates/index.js'
import { isArrayOf as isArrayOfFunc } from './is-array-of/index.js'
import { make as makeFunc } from './make/index.js'
import {
  randomPick as randomPickFunc,
  randomPickMany as randomPickManyFunc
} from './random-pick/index.js'
import { shuffle as shuffleFunc } from './shuffle/index.js'

export namespace Arrays {
  export const findDuplicates = findDuplicatesFunc
  export const isArrayOf = isArrayOfFunc
  export const make = makeFunc
  export const randomPick = randomPickFunc
  export const randomPickMany = randomPickManyFunc
  export const shuffle = shuffleFunc
}
