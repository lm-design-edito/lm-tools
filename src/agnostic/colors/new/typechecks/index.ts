import { isNonNullObject } from '../../../objects/is-object/index.js'
import {
  Hex,
  Rgba,
  Hsla,
  Hsba,
  Laba,
  Lcha,
  Cmyka,
  Xyza,
  CssColor,
  cssColors
} from '../types.js'

export const isHex = (color: unknown): color is Hex => {
  if (typeof color !== 'string') return false
  if (!color.startsWith('#')) return false
  const withoutHash = color.slice(1)
  const withoutHashLength = withoutHash.length
  const allowedLengths = [3, 4, 6, 8]
  if (!allowedLengths.includes(withoutHashLength)) return false
  return /^[0-9a-f]+$/igm.test(withoutHash)
}

export const isRgb = (color: unknown): color is Rgba => {
  if (!isNonNullObject(color)) return false
  const { r, g, b, a } = color as any
  if (typeof r !== 'number') return false
  if (typeof g !== 'number') return false
  if (typeof b !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

export const isHsl = (color: unknown): color is Hsla => {
  if (!isNonNullObject(color)) return false
  const { h, s, l, a } = color as any
  if (typeof h !== 'number') return false
  if (typeof s !== 'number') return false
  if (typeof l !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

export const isHsb = (color: unknown): color is Hsba => {
  if (!isNonNullObject(color)) return false
  const { h, s, b, a } = color as any
  if (typeof h !== 'number') return false
  if (typeof s !== 'number') return false
  if (typeof b !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

export const isLab = (color: unknown): color is Laba => {
  if (!isNonNullObject(color)) return false
  const { l, a, b, al } = color as any
  if (typeof l !== 'number') return false
  if (typeof a !== 'number') return false
  if (typeof b !== 'number') return false
  if (al !== undefined && typeof al !== 'number') return false
  return true
}

export const isLch = (color: unknown): color is Lcha => {
  if (!isNonNullObject(color)) return false
  const { l, c, h, a } = color as any
  if (typeof l !== 'number') return false
  if (typeof c !== 'number') return false
  if (typeof h !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

export const isCmyk = (color: unknown): color is Cmyka => {
  if (!isNonNullObject(color)) return false
  const { c, m, y, k, a } = color as any
  if (typeof c !== 'number') return false
  if (typeof m !== 'number') return false
  if (typeof y !== 'number') return false
  if (typeof k !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

export const isXyz = (color: unknown): color is Xyza => {
  if (!isNonNullObject(color)) return false
  const { x, y, z, a } = color as any
  if (typeof x !== 'number') return false
  if (typeof y !== 'number') return false
  if (typeof z !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

export const isCssColor = (color: unknown): color is CssColor => typeof color === 'string'
  && (cssColors as any)[color] !== undefined
