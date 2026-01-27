/**
 * Merges multiple flag strings into a single string containing each flag only once.
 * 
 * @param {...string[]} flagStrs - Flag strings to merge.
 * @returns {string} Merged flags string.
 */
export function mergeFlags (...flagStrs: string[]): string {
  const flagsSet = new Set<string>()
  flagStrs.forEach(flagStr => flagStr
    .split('')
    .forEach(char => flagsSet.add(char))
  )
  return Array.from(flagsSet.values()).join('')
}

/**
 * Returns a new RegExp with combined flags.
 * 
 * @param {RegExp} regexp - The original regular expression.
 * @param {string} flags - Flags to add.
 * @returns {RegExp} New regular expression with combined flags.
 */
export function setFlags (regexp: RegExp, flags: string): RegExp {
  const mergedFlags = mergeFlags(regexp.flags, flags)
  return new RegExp(`${regexp.source}`, mergedFlags)
}

/**
 * Anchors a RegExp to the start of a string.
 * 
 * @param {RegExp} regexp - The original regular expression.
 * @param {string} [flags='g'] - Optional flags to apply.
 * @returns {RegExp} Anchored RegExp.
 */
export function fromStart (regexp: RegExp, flags: string = 'g'): RegExp {
  const mergedFlags = mergeFlags(regexp.flags, flags)
  return new RegExp(`^(${regexp.source})`, mergedFlags)
}

/**
 * Anchors a RegExp to the end of a string.
 * 
 * @param {RegExp} regexp - The original regular expression.
 * @param {string} [flags='g'] - Optional flags to apply.
 * @returns {RegExp} Anchored RegExp.
 */
export function toEnd (regexp: RegExp, flags: string = 'g'): RegExp {
  const mergedFlags = mergeFlags(regexp.flags, flags)
  return new RegExp(`(${regexp.source})$`, mergedFlags)
}

/**
 * Anchors a RegExp to match the entire string.
 * 
 * @param {RegExp} regexp - The original regular expression.
 * @param {string} [flags='g'] - Optional flags to apply.
 * @returns {RegExp} Anchored RegExp.
 */
export function fromStartToEnd (regexp: RegExp, flags: string = 'g'): RegExp {
  const mergedFlags = mergeFlags(regexp.flags, flags)
  return fromStart(toEnd(regexp, mergedFlags), mergedFlags)
}

/**
 * Checks if a string starts with a pattern.
 *
 * @param string - The string to test.
 * @param regexp - The regular expression pattern.
 * @param [returnMatches=false] - If true, returns matches; otherwise, returns boolean.
 * @param [flags='g'] - Optional flags.
 * @returns {boolean | RegExpMatchArray | null} Boolean or match array based on `returnMatches`.
 */
export function stringStartsWith (string: string, regexp: RegExp): boolean
export function stringStartsWith (string: string, regexp: RegExp, returnMatches: true): RegExpMatchArray | null
export function stringStartsWith (string: string, regexp: RegExp, returnMatches: false): boolean
export function stringStartsWith (string: string, regexp: RegExp, returnMatches: false, flags: string): boolean
export function stringStartsWith (string: string, regexp: RegExp, returnMatches: true, flags: string): RegExpMatchArray | null
export function stringStartsWith (string: string, regexp: RegExp, returnMatches = false, flags: string = 'g'): RegExpMatchArray | null | boolean {
  const actualRegexp = fromStart(regexp, flags)
  return returnMatches ? string.match(actualRegexp) : actualRegexp.test(string)
}

/**
 * Checks if a string ends with a pattern.
 *
 * @param string - The string to test.
 * @param regexp - The regular expression pattern.
 * @param [returnMatches=false] - If true, returns matches; otherwise, returns boolean.
 * @param [flags='g'] - Optional flags.
 * @returns {boolean | RegExpMatchArray | null} Boolean or match array based on `returnMatches`.
 */
export function stringEndsWith (string: string, regexp: RegExp): boolean
export function stringEndsWith (string: string, regexp: RegExp, returnMatches: true): RegExpMatchArray | null
export function stringEndsWith (string: string, regexp: RegExp, returnMatches: false): boolean
export function stringEndsWith (string: string, regexp: RegExp, returnMatches: false, flags: string): boolean
export function stringEndsWith (string: string, regexp: RegExp, returnMatches: true, flags: string): RegExpMatchArray | null
export function stringEndsWith (string: string, regexp: RegExp, returnMatches = false, flags: string = 'g'): RegExpMatchArray | null | boolean {
  const actualRegexp = toEnd(regexp, flags)
  return returnMatches ? string.match(actualRegexp) : actualRegexp.test(string)
}

/**
 * Checks if a string fully matches a pattern.
 *
 * @param string - The string to test.
 * @param regexp - The regular expression pattern.
 * @param [returnMatches=false] - If true, returns matches; otherwise, returns boolean.
 * @param [flags='g'] - Optional flags.
 * @returns {boolean | RegExpMatchArray | null} Boolean or match array based on `returnMatches`.
 */
export function stringIs (string: string, regexp: RegExp): boolean
export function stringIs (string: string, regexp: RegExp, returnMatches: true): RegExpMatchArray | null
export function stringIs (string: string, regexp: RegExp, returnMatches: false): boolean
export function stringIs (string: string, regexp: RegExp, returnMatches: false, flags: string): boolean
export function stringIs (string: string, regexp: RegExp, returnMatches: true, flags: string): RegExpMatchArray | null
export function stringIs (string: string, regexp: RegExp, returnMatches = false, flags: string = 'g'): RegExpMatchArray | null | boolean {
  const actualRegexp = fromStartToEnd(regexp, flags)
  return returnMatches ? string.match(actualRegexp) : actualRegexp.test(string)
}

/**
 * Creates a RegExp that matches any of the provided strings.
 * 
 * @param {string[]} strings - Strings to match.
 * @returns {RegExp} Regular expression matching all strings.
 */
export function fromStrings (strings: string[]): RegExp {
  const rootsMap = stringsToRootsMap(strings)
  const source = sourceFromRootsMap(rootsMap, false)
  const regexp = new RegExp(source)
  return regexp
}

/**
 * Escapes special RegExp characters in a string.
 * - Newlines are turned into `\\n`
 * - Other whitespace characters are normalized to `\\s`
 * - RegExp special characters (including backslash) are escaped
 * 
 * @param {string} string - String to escape.
 * @returns {string} Escaped string.
 */
export function escape (string: string): string {
  let result = ''
  for (const ch of string) {
    if (ch === '\n') { result += '\\n' }
    else if (/\s/.test(ch)) { result += '\\s' } // any other whitespace (space, tab, etc.)
    else if (/[.*+?^${}()|[\]\\]/.test(ch)) { result += '\\' + ch } // regex special chars (including backslash)
    else { result += ch }
  }
  return result
}

/* * * * * * * * * UTILS * * * * * * * * */

type RootsMap = Map<string, { subRootsMap: RootsMap, isWordEnd: boolean }>

function stringsToRootsMap (strings: string[], rootsMap: RootsMap = new Map()): RootsMap {
  const lengthSorted = strings.sort((strA, strB) => strA.length - strB.length)
  lengthSorted.forEach(string => {
    const [firstChar, ...lastChars] = string.split('')
    const isWordEnd = lastChars.length === 0
    if (firstChar === undefined) return
    const roots = Array.from(rootsMap.keys())
    const foundRoot = roots.find(root => new RegExp(`^(${escape(root)})`).test(string))
    const subRootsMap = foundRoot !== undefined
      ? rootsMap.get(foundRoot)?.subRootsMap
      : undefined
    if (foundRoot === undefined || subRootsMap === undefined) {
      const subRootsMap: RootsMap = new Map()
      stringsToRootsMap([lastChars.join('')], subRootsMap)
      return rootsMap.set(firstChar, { subRootsMap, isWordEnd })
    }
    stringsToRootsMap([lastChars.join('')], subRootsMap)
  })
  return rootsMap
}

function sourceFromRootsMap (
  rootsMap: RootsMap,
  isOptional: boolean
): string {
  const rootsMapEntries = Array.from(rootsMap.entries())
  if (rootsMapEntries.length === 0) return ''
  const regexpBody = rootsMapEntries.map(([root, rootData]) => {
    return `${escape(root)}${sourceFromRootsMap(
      rootData.subRootsMap,
      rootData.isWordEnd
    )}`
  }).join('|')
  return isOptional
    ? `(${regexpBody})?`
    : `(${regexpBody})`
}
