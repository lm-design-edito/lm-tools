import { describe, it, expect } from 'vitest'
import {
  mergeFlags,
  setFlags,
  fromStart,
  toEnd,
  fromStartToEnd,
  stringStartsWith,
  stringEndsWith,
  stringIs,
  fromStrings,
  escape
} from './index.js'

describe('mergeFlags', () => {
  it('merges flags without duplicates', () => {
    expect(mergeFlags('g', 'g')).toBe('g')
    const merged = mergeFlags('g', 'i', 'm')
    expect(merged.length).toBe(3)
    expect(merged.includes('g')).toBe(true)
    expect(merged.includes('i')).toBe(true)
    expect(merged.includes('m')).toBe(true)
  })
})

describe('setFlags', () => {
  it('adds new flags to existing regexp flags', () => {
    const regexp = /abc/g
    const withFlags = setFlags(regexp, 'i')
    expect(withFlags.flags.includes('g')).toBe(true)
    expect(withFlags.flags.includes('i')).toBe(true)
  })
})

describe('fromStart / toEnd / fromStartToEnd', () => {
  it('anchors regexps at the start', () => {
    const re = fromStart(/abc/)
    expect('abcdef'.match(re)).not.toBeNull()
    expect('zabc'.match(re)).toBeNull()
  })

  it('anchors regexps at the end', () => {
    const re = toEnd(/abc/)
    expect('zabc'.match(re)).not.toBeNull()
    expect('abczz'.match(re)).toBeNull()
  })

  it('anchors regexps at both start and end', () => {
    const re = fromStartToEnd(/abc/)
    expect('abc'.match(re)).not.toBeNull()
    expect('zabc'.match(re)).toBeNull()
    expect('abczz'.match(re)).toBeNull()
  })
})

describe('stringStartsWith', () => {
  it('returns a boolean by default', () => {
    const ok = stringStartsWith('foobar', /foo/)
    const ko = stringStartsWith('barfoo', /foo/)
    expect(ok).toBe(true)
    expect(ko).toBe(false)
  })

  it('can return matches when requested', () => {
    const result = stringStartsWith('foobar', /foo/, true)
    if (result !== null) {
      expect(result[0]).toBe('foo')
    }
  })
})

describe('stringEndsWith', () => {
  it('returns a boolean by default', () => {
    const ok = stringEndsWith('foobar', /bar/)
    const ko = stringEndsWith('barfoo', /bar/)
    expect(ok).toBe(true)
    expect(ko).toBe(false)
  })

  it('can return matches when requested', () => {
    const result = stringEndsWith('foobar', /bar/, true)
    if (result !== null) {
      expect(result[0]).toBe('bar')
    }
  })
})

describe('stringIs', () => {
  it('checks for a full-string match', () => {
    const ok = stringIs('foo', /foo/)
    const ko1 = stringIs('foobar', /foo/)
    const ko2 = stringIs('barfoo', /foo/)
    expect(ok).toBe(true)
    expect(ko1).toBe(false)
    expect(ko2).toBe(false)
  })

  it('can return matches when requested', () => {
    const result = stringIs('foo', /foo/, true)
    if (result !== null) {
      expect(result[0]).toBe('foo')
    }
  })
})

describe('fromStrings', () => {
  it('creates a regexp matching any of the provided strings', () => {
    const strings = ['cat', 'car', 'dog']
    const re = fromStrings(strings)
    expect('cat'.match(re)).not.toBeNull()
    expect('car'.match(re)).not.toBeNull()
    expect('dog'.match(re)).not.toBeNull()
    expect('cow'.match(re)).toBeNull()
  })
})

describe('escape', () => {
  it('escapes regexp special characters', () => {
    const input = 'a.b*c+d?^$()|[]{}\\'
    const escaped = escape(input)
    expect(new RegExp(escaped).test(input)).toBe(true)
    expect(escaped).toContain('\\.')
    expect(escaped).toContain('\\*')
    expect(escaped).toContain('\\?')
  })

  it('escapes whitespace and newlines', () => {
    const input = 'a b\nc'
    const escaped = escape(input)
    expect(escaped.includes('\\s')).toBe(true)
    expect(escaped.includes('\\n')).toBe(true)
  })
})
