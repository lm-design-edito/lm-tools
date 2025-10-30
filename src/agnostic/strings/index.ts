import { CharCodes as CharCodesNamespace } from './char-codes/index.js'
import {
  matches as matchesFunc,
  matchesSome as matchesSomeFunc,
  matchesEvery as matchesEveryFunc
} from './matches/index.js'
import { parseTable as parseTableFunc } from './parse-table/index.js'
import { replaceAll as replaceAllFunc } from './replace-all/index.js'
import { normalizeIndent as normalizeIndentFunc } from './normalize-indent/index.js'
import { toAlphanum as toAlphanumFunc } from './to-alphanum/index.js'
import {
  trimStart as trimStartFunc,
  trimEnd as trimEndFunc
} from './trim/index.js'

export namespace Strings {
  // CharCodes
  export import CharCodes = CharCodesNamespace
  // Matches
  export const matches = matchesFunc
  export const matchesSome = matchesSomeFunc
  export const matchesEvery = matchesEveryFunc
  // Normalize indent
  export const normalizeIndent = normalizeIndentFunc
  // Read table
  export const parseTable = parseTableFunc
  // Replace all
  export const replaceAll = replaceAllFunc
  // To alphanum
  export const toAlphanum = toAlphanumFunc
  // Trim
  export const trimStart = trimStartFunc
  export const trimEnd = trimEndFunc
}
