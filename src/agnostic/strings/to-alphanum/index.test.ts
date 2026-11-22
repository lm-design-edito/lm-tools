import { describe, it, expect } from 'vitest'
import { toAlphanum } from './index.js'

describe('toAlphanum', () => {
  describe('stripping', () => {
    it('drops punctuation and spaces by default', () => {
      expect(toAlphanum('Hello, World!')).toBe('HelloWorld')
    })

    it('keeps digits', () => {
      expect(toAlphanum('Track 01 - Intro')).toBe('Track01Intro')
    })

    it('returns an empty string for one made only of non-alphanumeric characters', () => {
      expect(toAlphanum('--- !!! ---')).toBe('')
    })
  })

  describe('replacer', () => {
    it('substitutes the given replacer instead of dropping the match', () => {
      expect(toAlphanum('Hello, World', '-')).toBe('Hello-World')
    })

    it('collapses consecutive matches into a single replacer', () => {
      expect(toAlphanum('Hello,   World!!!', '-')).toBe('Hello-World-')
    })
  })

  describe('unicode', () => {
    it('keeps an accented letter as a letter, stripping only punctuation around it', () => {
      expect(toAlphanum('yé-yé')).toBe('yéyé')
    })

    it('keeps a full run of accented words', () => {
      expect(toAlphanum('Sébastien Tellier')).toBe('SébastienTellier')
    })

    it('keeps a cedilla', () => {
      expect(toAlphanum('ça va ?')).toBe('çava')
    })
  })
})
