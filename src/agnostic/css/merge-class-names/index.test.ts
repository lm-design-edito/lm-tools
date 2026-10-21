import { describe, it, expect } from 'vitest'
import { mergeClassNames } from './index.js'

describe('mergeClassNames', () => {
  describe('joining', () => {
    it('joins several names with a single space', () => {
      expect(mergeClassNames('lm-video', 'is-playing')).toBe('lm-video is-playing')
    })

    it('returns an empty string when given nothing', () => {
      expect(mergeClassNames()).toBe('')
    })

    it('keeps the order it was given', () => {
      expect(mergeClassNames('c', 'a', 'b')).toBe('c a b')
    })

    it('keeps a name that appears twice', () => {
      expect(mergeClassNames('lm-video', 'lm-video')).toBe('lm-video lm-video')
    })
  })

  describe('discarding', () => {
    it('drops `null` and `undefined`', () => {
      expect(mergeClassNames('lm-video', null, 'is-playing', undefined)).toBe('lm-video is-playing')
    })

    it('drops a name that is empty or only whitespace', () => {
      expect(mergeClassNames('lm-video', '', '   ', '\t')).toBe('lm-video')
    })

    it('returns an empty string when everything was discarded', () => {
      expect(mergeClassNames(null, undefined, '  ')).toBe('')
    })
  })

  describe('trimming', () => {
    it('trims each name', () => {
      expect(mergeClassNames('  lm-video  ', '\tis-playing\n')).toBe('lm-video is-playing')
    })

    it('leaves inner whitespace alone, so a pre-joined string survives', () => {
      expect(mergeClassNames(' lm-video is-playing ')).toBe('lm-video is-playing')
    })
  })

  describe('nested arrays', () => {
    it('flattens an array of names', () => {
      expect(mergeClassNames(['lm-video', 'is-playing'])).toBe('lm-video is-playing')
    })

    it('mixes bare names and arrays', () => {
      expect(mergeClassNames('lm-video', ['is-playing', 'is-loud'], 'is-visible'))
        .toBe('lm-video is-playing is-loud is-visible')
    })

    it('discards inside an array too', () => {
      expect(mergeClassNames(['lm-video', null, '', undefined, 'is-playing'])).toBe('lm-video is-playing')
    })

    it('contributes nothing for an empty or fully discarded array', () => {
      expect(mergeClassNames('lm-video', [], [null, undefined])).toBe('lm-video')
    })
  })
})
