import type { Color, TransformedColor } from '../types.js'
import { isRgb, isHsl, isHsb, isCmyk, isXyz, isLab, isLch, isCssColor, isHex } from '../typechecks/index.js'
import { clamp } from '../../numbers/clamp/index.js'
import { absoluteModulo } from '../../numbers/absolute-modulo/index.js'
import { toRgb, toHex } from '../convert/index.js'
import { unknownToString } from '../../errors/unknown-to-string/index.js'

/**
 * Clamps and normalizes a color's channel values to their valid ranges.
 *
 * @template C - The input color type.
 * @param {C} color - The color to tidy.
 * @returns {TransformedColor<C>} The color with all channels clamped to valid ranges, in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function tidy <C extends Color> (color: C): TransformedColor<C> {
  const _color: Color = color

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (isRgb(_color)) return {
    r: clamp(_color.r, 0, 255),
    g: clamp(_color.g, 0, 255),
    b: clamp(_color.b, 0, 255),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (isHsl(_color)) return {
    h: absoluteModulo(_color.h, 360),
    s: clamp(_color.s, 0, 100),
    l: clamp(_color.l, 0, 100),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (isHsb(_color)) return {
    h: absoluteModulo(_color.h, 360),
    s: clamp(_color.s, 0, 100),
    b: clamp(_color.b, 0, 100),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (isCmyk(_color)) return {
    c: clamp(_color.c, 0, 100),
    m: clamp(_color.m, 0, 100),
    y: clamp(_color.y, 0, 100),
    k: clamp(_color.k, 0, 100),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (isXyz(_color)) return {
    x: _color.x,
    y: _color.y,
    z: _color.z,
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (isLab(_color)) return {
    l: clamp(_color.l, 0, 100),
    a: _color.a,
    b: _color.b,
    al: clamp(_color.al ?? 1, 0, 1)
  } as TransformedColor<C>

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (isLch(_color)) return {
    l: clamp(_color.l, 0, 100),
    c: Math.max(0, _color.c),
    h: clamp(_color.h, 0, 360),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isCssColor(_color)) return tidy(toRgb(_color)) as TransformedColor<C>
  if (isHex(_color)) return toHex(tidy(toRgb(_color))) as TransformedColor<C>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}
