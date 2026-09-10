import { describe, it, expect } from 'vitest'
import { parseSrt } from './index.js'

const twoCues = `1
00:00:01,000 --> 00:00:02,000
Bonjour

2
00:00:03,000 --> 00:00:04,000
Au revoir`

describe('parseSrt', () => {
  it('reads a cue whole', () => {
    expect(parseSrt(twoCues)[0]).toMatchObject({
      id: 1,
      start: 1000,
      end: 2000,
      content: 'Bonjour'
    })
  })

  it('keeps the file order', () => {
    expect(parseSrt(twoCues).map(cue => cue.content)).toEqual(['Bonjour', 'Au revoir'])
  })

  describe('line endings', () => {
    it('parses a CRLF file, the format de facto norm', () => {
      expect(parseSrt(twoCues.replace(/\n/g, '\r\n'))).toHaveLength(2)
    })

    it('parses a lone-CR file', () => {
      expect(parseSrt(twoCues.replace(/\n/g, '\r'))).toHaveLength(2)
    })
  })

  describe('block delimiting', () => {
    it('reads a bare number as text, not as the next cue id', () => {
      const cues = parseSrt(`1
00:00:01,000 --> 00:00:02,000
1914

2
00:00:03,000 --> 00:00:04,000
La guerre`)
      expect(cues).toHaveLength(2)
      expect(cues[0]?.content).toBe('1914')
    })

    it('keeps the newlines inside a multi-line cue', () => {
      const cues = parseSrt(`1
00:00:01,000 --> 00:00:02,000
Première ligne
Deuxième ligne`)
      expect(cues[0]?.content).toBe('Première ligne\nDeuxième ligne')
    })

    it('tolerates a separator line holding spaces', () => {
      expect(parseSrt(twoCues.replace('\n\n', '\n   \n'))).toHaveLength(2)
    })

    it('tolerates blank lines around the file', () => {
      expect(parseSrt(`\n\n${twoCues}\n\n`)).toHaveLength(2)
    })
  })

  describe('the id line', () => {
    it('keeps the number written in the file, however it is numbered', () => {
      const cues = parseSrt(`57
00:00:01,000 --> 00:00:02,000
Bonjour`)
      expect(cues[0]?.id).toBe(57)
    })

    it('numbers a cue by its position when the file leaves the id out', () => {
      const cues = parseSrt(`00:00:01,000 --> 00:00:02,000
Bonjour

00:00:03,000 --> 00:00:04,000
Au revoir`)
      expect(cues.map(cue => cue.id)).toEqual([1, 2])
    })
  })

  describe('dropping what cannot be read', () => {
    it('drops a block whose timecode is malformed', () => {
      const cues = parseSrt(`1
00:00:01,000 -> 00:00:02,000
Bonjour

2
00:00:03,000 --> 00:00:04,000
Au revoir`)
      expect(cues.map(cue => cue.content)).toEqual(['Au revoir'])
    })

    it('drops a block with a timecode but no text', () => {
      expect(parseSrt(`1
00:00:01,000 --> 00:00:02,000`)).toEqual([])
    })

    it('returns nothing at all for an empty file', () => {
      expect(parseSrt('')).toEqual([])
    })

    it('returns nothing for a file that is not SRT', () => {
      expect(parseSrt('<!doctype html><title>404</title>')).toEqual([])
    })
  })
})
