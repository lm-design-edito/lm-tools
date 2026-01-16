import { describe, it, expect } from 'vitest'
import { normalizeExtension } from './index.js'

describe('normalizeExtension', () => {
  it('removes leading dot', () => {
    expect(normalizeExtension('.jpg')).toBe('jpg')
    expect(normalizeExtension('.png')).toBe('png')
  })

  it('converts to lowercase', () => {
    expect(normalizeExtension('JPG')).toBe('jpg')
    expect(normalizeExtension('PNG')).toBe('png')
  })

  it('normalizes image extensions', () => {
    expect(normalizeExtension('jpeg')).toBe('jpg')
    expect(normalizeExtension('tiff')).toBe('tif')
  })

  it('normalizes audio extensions', () => {
    expect(normalizeExtension('m4a')).toBe('aac')
    expect(normalizeExtension('wave')).toBe('wav')
  })

  it('normalizes video extensions', () => {
    expect(normalizeExtension('m4v')).toBe('mp4')
    expect(normalizeExtension('mpeg')).toBe('mpg')
  })

  it('normalizes web extensions', () => {
    expect(normalizeExtension('htm')).toBe('html')
    expect(normalizeExtension('yml')).toBe('yaml')
  })

  it('normalizes document extensions', () => {
    expect(normalizeExtension('doc')).toBe('docx')
    expect(normalizeExtension('xls')).toBe('xlsx')
  })

  it('returns extension as-is if no alias exists', () => {
    expect(normalizeExtension('xyz')).toBe('xyz')
    expect(normalizeExtension('unknown')).toBe('unknown')
  })

  it('accepts custom aliases', () => {
    const customAliases = { 'custom': 'standard' }
    expect(normalizeExtension('custom', customAliases)).toBe('standard')
  })
})
