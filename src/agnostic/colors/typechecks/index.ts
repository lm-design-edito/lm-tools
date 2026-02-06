import { isNonNullObject } from '../../objects/is-object/index.js'
import {
  type Hex,
  type Rgba,
  type Hsla,
  type Hsba,
  type Laba,
  type Lcha,
  type Cmyka,
  type Xyza,
  type CssColor,
  type Color
} from '../types.js'
import { cssColors } from '../cssColorsMap.js'

/**
 * Type guard to check if a value is a valid hexadecimal color string.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Hex} True if the value is a valid hex color, false otherwise.
 */
export const isHex = (color: unknown): color is Hex => {
  if (typeof color !== 'string') return false
  if (!color.startsWith('#')) return false
  const withoutHash = color.slice(1)
  const withoutHashLength = withoutHash.length
  const allowedLengths = [3, 4, 6, 8]
  if (!allowedLengths.includes(withoutHashLength)) return false
  return /^[0-9a-f]+$/igm.test(withoutHash)
}

/**
 * Type guard to check if a value is a valid RGBA color object.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Rgba} True if the value is a valid RGBA color, false otherwise.
 */
export const isRgb = (color: unknown): color is Rgba => {
  if (!isNonNullObject(color)) return false
  const { r, g, b, a } = color as any
  if (typeof r !== 'number') return false
  if (typeof g !== 'number') return false
  if (typeof b !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

/**
 * Type guard to check if a value is a valid HSLA color object.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Hsla} True if the value is a valid HSLA color, false otherwise.
 */
export const isHsl = (color: unknown): color is Hsla => {
  if (!isNonNullObject(color)) return false
  const { h, s, l, a } = color as any
  if (typeof h !== 'number') return false
  if (typeof s !== 'number') return false
  if (typeof l !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

/**
 * Type guard to check if a value is a valid HSBA color object.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Hsba} True if the value is a valid HSBA color, false otherwise.
 */
export const isHsb = (color: unknown): color is Hsba => {
  if (!isNonNullObject(color)) return false
  const { h, s, b, a } = color as any
  if (typeof h !== 'number') return false
  if (typeof s !== 'number') return false
  if (typeof b !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

/**
 * Type guard to check if a value is a valid CIELAB color object.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Laba} True if the value is a valid CIELAB color, false otherwise.
 */
export const isLab = (color: unknown): color is Laba => {
  if (!isNonNullObject(color)) return false
  const { l, a, b, al } = color as any
  if (typeof l !== 'number') return false
  if (typeof a !== 'number') return false
  if (typeof b !== 'number') return false
  if (al !== undefined && typeof al !== 'number') return false
  return true
}

/**
 * Type guard to check if a value is a valid CIELCh color object.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Lcha} True if the value is a valid CIELCh color, false otherwise.
 */
export const isLch = (color: unknown): color is Lcha => {
  if (!isNonNullObject(color)) return false
  const { l, c, h, a } = color as any
  if (typeof l !== 'number') return false
  if (typeof c !== 'number') return false
  if (typeof h !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

/**
 * Type guard to check if a value is a valid CMYK color object.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Cmyka} True if the value is a valid CMYK color, false otherwise.
 */
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

/**
 * Type guard to check if a value is a valid CIE XYZ color object.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Xyza} True if the value is a valid CIE XYZ color, false otherwise.
 */
export const isXyz = (color: unknown): color is Xyza => {
  if (!isNonNullObject(color)) return false
  const { x, y, z, a } = color as any
  if (typeof x !== 'number') return false
  if (typeof y !== 'number') return false
  if (typeof z !== 'number') return false
  if (a !== undefined && typeof a !== 'number') return false
  return true
}

/**
 * Type guard to check if a value is a valid CSS named color.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is CssColor} True if the value is a valid CSS named color, false otherwise.
 */
export const isCssColor = (color: unknown): color is CssColor => typeof color === 'string'
  && (cssColors as any)[color] !== undefined

/**
 * Type guard to check if a value is any valid color format.
 *
 * @param {unknown} color - The value to check.
 * @returns {color is Color} True if the value is a valid color in any supported format, false otherwise.
 */
export const isColor = (color: unknown): color is Color => {
  if (isHex(color)) return true
  if (isCssColor(color)) return true
  if (isRgb(color)) return true
  if (isHsl(color)) return true
  if (isHsb(color)) return true
  if (isCmyk(color)) return true
  if (isXyz(color)) return true
  if (isLab(color)) return true
  if (isLch(color)) return true
  return false
}
