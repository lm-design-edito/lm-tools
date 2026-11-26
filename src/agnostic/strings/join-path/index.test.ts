import { describe, it, expect } from 'vitest'
import { joinPath } from './index.js'

describe('joinPath', () => {
  describe('joining', () => {
    it('joins segments with a single slash', () => {
      expect(joinPath('var', 'www', 'html')).toBe('var/www/html')
    })

    it('keeps the leading slash of an absolute first segment', () => {
      expect(joinPath('/var', 'www')).toBe('/var/www')
    })

    it('collapses repeated and edge slashes', () => {
      expect(joinPath('a/b/', '/c//d/')).toBe('a/b/c/d')
    })

    it('accepts segments already holding several slashes', () => {
      expect(joinPath('a/b', 'c/d')).toBe('a/b/c/d')
    })

    it('returns an empty string when there is nothing to join', () => {
      expect(joinPath()).toBe('')
      expect(joinPath('', '/')).toBe('')
    })

    it('returns the root alone for an absolute path with no segment', () => {
      expect(joinPath('/')).toBe('/')
    })
  })

  describe('resolving', () => {
    it('drops a single dot', () => {
      expect(joinPath('a', '.', 'b')).toBe('a/b')
    })

    it('climbs one segment on a double dot', () => {
      expect(joinPath('a/b', '../c')).toBe('a/c')
    })

    it('keeps a double dot that climbs above a relative path', () => {
      expect(joinPath('a', '../../b')).toBe('../b')
    })

    it('ignores a double dot that would climb above an absolute root', () => {
      expect(joinPath('/a', '../../b')).toBe('/b')
    })
  })
})
