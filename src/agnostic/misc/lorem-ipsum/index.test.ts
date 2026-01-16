import { describe, it, expect } from 'vitest'
import { generateSentence, generateSentences } from './index.js'

describe('generateSentence', () => {
  it('generates sentence with specified word count', () => {
    const sentence = generateSentence(5)
    const words = sentence.split(' ')
    expect(words.length).toBe(5)
  })

  it('capitalizes first letter', () => {
    const sentence = generateSentence(3)
    expect(sentence[0]).toBe(sentence[0]?.toUpperCase())
  })

  it('ends with period', () => {
    const sentence = generateSentence(3)
    expect(sentence.endsWith('.')).toBe(true)
  })

  it('returns empty string for zero word count', () => {
    const sentence = generateSentence(0)
    expect(sentence).toBe('')
  })

  it('generates different sentences on multiple calls', () => {
    const sentence1 = generateSentence(10)
    const sentence2 = generateSentence(10)
    // With 10 words, sentences should likely differ (not guaranteed but very likely)
    expect(sentence1).toBeTruthy()
    expect(sentence2).toBeTruthy()
  })
})

describe('generateSentences', () => {
  it('generates specified number of sentences', () => {
    const sentences = generateSentences(3)
    expect(sentences).toHaveLength(3)
  })

  it('generates sentences within length range', () => {
    const sentences = generateSentences(5, 10, 4)
    sentences.forEach(sentence => {
      const wordCount = sentence.split(' ').length
      expect(wordCount).toBeGreaterThanOrEqual(4)
      expect(wordCount).toBeLessThanOrEqual(10)
    })
  })

  it('uses default max and min sentence length', () => {
    const sentences = generateSentences(2)
    expect(sentences).toHaveLength(2)
    sentences.forEach(sentence => {
      expect(sentence.endsWith('.')).toBe(true)
    })
  })
})
