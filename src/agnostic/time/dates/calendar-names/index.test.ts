import { describe, it, expect } from 'vitest'
import { monthNames, weekdayNames } from './index.js'

describe('weekdayNames', () => {
  it('starts the week on Sunday, as getDay numbers it', () => {
    expect(weekdayNames('en', 'long')[0]).toBe('Sunday')
    expect(weekdayNames('en', 'long')[4]).toBe('Thursday')
  })

  it('reads the locale', () => {
    expect(weekdayNames('fr', 'long')[0]).toBe('dimanche')
  })

  it('falls back to English on a locale the runtime does not know', () => {
    expect(weekdayNames('zz', 'long')[0]).toBe('Sunday')
  })
})

describe('monthNames', () => {
  it('starts the year on January, as getMonth numbers it', () => {
    expect(monthNames('en', 'long')[0]).toBe('January')
    expect(monthNames('en', 'long')[11]).toBe('December')
  })

  it('reads the locale', () => {
    expect(monthNames('fr', 'long')[0]).toBe('janvier')
  })

  it('gives twelve months and seven days', () => {
    expect(monthNames('en', 'short')).toHaveLength(12)
    expect(weekdayNames('en', 'short')).toHaveLength(7)
  })
})
