import { absoluteModulo } from '../../numbers/absolute-modulo/index.js'
import { tidy } from '../tidy/index.js'
import type {
  Color,
  Hex,
  Rgba,
  Hsla,
  Hsba,
  Laba,
  Lcha,
  Cmyka,
  Xyza,
  CssColor,
  TransformedColor,
  Srgba
} from '../types.js'
import { cssColors } from '../cssColorsMap.js'
import {
  isHex,
  isRgb,
  isHsl,
  isHsb,
  isCmyk,
  isCssColor,
  isXyz,
  isLab,
  isLch
} from '../typechecks/index.js'
import { unknownToString } from '../../errors/unknown-to-string/index.js'

/* * * * * * * * * * * * * * * * * *
 * Convertion building blocks
 * * * * * * * * * * * * * * * * * */

// RGB ↔ Hex
// [WIP] maybe use absoluteModulo where needed?
// needs rewrite, hex char checks, etc
function _hex2rgb (hex: Hex): Rgba {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  if (!isHex(hex)) throw new Error(`invalid hex color ${unknownToString(hex)}`)
  let hexString: string = hex
  const inputHex = hexString
  const startsWithHash = hexString.startsWith('#')
  if (!startsWithHash) throw new Error(`invalid hex color ${inputHex}`)
  hexString = hexString.slice(1)
  if (hexString.length === 3) {
    hexString = hexString.split('').map(c => c + c).join('') + 'ff'
  } else if (hexString.length === 4) {
    hexString = hexString.split('').map(c => c + c).join('')
  } else if (hexString.length === 6) {
    hexString = hexString + 'ff'
  } else if (hexString.length !== 8) throw new Error(`invalid hex color ${inputHex}`)
  const r = parseInt(hexString.slice(0, 2), 16)
  const g = parseInt(hexString.slice(2, 4), 16)
  const b = parseInt(hexString.slice(4, 6), 16)
  const a = parseInt(hexString.slice(6, 8), 16) / 255
  return { r, g, b, a }
}

function _rgb2hex (rgb: Rgba): Hex {
  const { r, g, b, a = 1 } = rgb
  const rHex = Math.round(r).toString(16).padStart(2, '0')
  const gHex = Math.round(g).toString(16).padStart(2, '0')
  const bHex = Math.round(b).toString(16).padStart(2, '0')
  const aHex = Math.round(a * 255).toString(16).padStart(2, '0')
  const returned: Hex = `#${rHex}${gHex}${bHex}${aHex}`
  if (!isHex(returned)) {
    // Here typescript says returned is 'never' but this is because
    // isHex function is more strict than Hex type, so technically
    // isHex(hex) can return false, for instance if hex === '#zzz'
    throw new Error(`invalid hex color output ${unknownToString(returned)}`)
  }
  return returned
}

// RGB ↔ CSS
function _css2rgb (color: CssColor): Rgba
function _css2rgb (color: string): Rgba | undefined
function _css2rgb (color: string | CssColor): Rgba | undefined {
  if (color in cssColors) return cssColors[color as CssColor]
  return undefined
}

const cssColorsWithHex = Object.entries(cssColors).map(([cssColor, rgba]) => ({
  name: cssColor as CssColor,
  hex: _rgb2hex(rgba),
  rgba
}))

function _rgb2css (rgb: Rgba): CssColor | undefined {
  const hexTarget = _rgb2hex(rgb)
  return cssColorsWithHex.find(c => c.hex === hexTarget)?.name
}

// RGB ↔ HSL
function _hsl2rgb (hsl: Hsla): Rgba {
  const { h, s, l, a = 1 } = hsl
  const H = absoluteModulo(h, 360) / 360
  const S = Math.max(0, Math.min(1, s / 100))
  const L = Math.max(0, Math.min(1, l / 100))
  const A = Math.max(0, Math.min(1, a))
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  let r: number
  let g: number
  let b: number
  if (S === 0) {
    r = g = b = L // achromatic
  } else {
    const q = L < 0.5 ? L * (1 + S) : L + S - L * S
    const p = 2 * L - q
    r = hue2rgb(p, q, H + 1 / 3)
    g = hue2rgb(p, q, H)
    b = hue2rgb(p, q, H - 1 / 3)
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: A
  }
}

function _rgb2hsl (rgb: Rgba): Hsla {
  const { r, g, b, a = 1 } = rgb
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const delta = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    if (max === R) {
      h = ((G - B) / delta + (G < B ? 6 : 0)) / 6
    } else if (max === G) {
      h = ((B - R) / delta + 2) / 6
    } else {
      h = ((R - G) / delta + 4) / 6
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a
  }
}

// RGB ↔ HSB
function _hsb2rgb (hsb: Hsba): Rgba {
  const { h, s, b, a = 1 } = hsb
  const H = absoluteModulo(h, 360) / 360
  const S = Math.max(0, Math.min(1, s / 100))
  const B = Math.max(0, Math.min(1, b / 100))
  const A = Math.max(0, Math.min(1, a))
  const i = Math.floor(H * 6)
  const f = H * 6 - i
  const p = B * (1 - S)
  const q = B * (1 - f * S)
  const t = B * (1 - (1 - f) * S)
  let r: number
  let g: number
  let blue: number
  switch (absoluteModulo(i, 6)) {
    case 0: r = B; g = t; blue = p; break
    case 1: r = q; g = B; blue = p; break
    case 2: r = p; g = B; blue = t; break
    case 3: r = p; g = q; blue = B; break
    case 4: r = t; g = p; blue = B; break
    case 5: r = B; g = p; blue = q; break
    default: r = g = blue = 0
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(blue * 255),
    a: A
  }
}

function _rgb2hsb (rgb: Rgba): Hsba {
  const { r, g, b, a = 1 } = rgb
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const delta = max - min
  let h = 0
  let s = 0
  const brightness = max
  if (max !== 0) { s = delta / max }
  if (delta !== 0) {
    if (max === R) {
      h = ((G - B) / delta + (G < B ? 6 : 0)) / 6
    } else if (max === G) {
      h = ((B - R) / delta + 2) / 6
    } else {
      h = ((R - G) / delta + 4) / 6
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(brightness * 100),
    a
  }
}

// RGB ↔ CMYK
function _cmyk2rgb (cmyka: Cmyka): Rgba {
  const { c, m, y, k, a = 1 } = cmyka
  // Clamp input to 0–100
  const C = Math.max(0, Math.min(100, c)) / 100
  const M = Math.max(0, Math.min(100, m)) / 100
  const Y = Math.max(0, Math.min(100, y)) / 100
  const K = Math.max(0, Math.min(100, k)) / 100
  const A = Math.max(0, Math.min(1, a))
  // CMYK → RGB formula
  const R = 1 - Math.min(1, C * (1 - K) + K)
  const G = 1 - Math.min(1, M * (1 - K) + K)
  const B = 1 - Math.min(1, Y * (1 - K) + K)
  return {
    r: Math.round(R * 255),
    g: Math.round(G * 255),
    b: Math.round(B * 255),
    a: A
  }
}

function _rgb2cmyk (rgb: Rgba): Cmyka {
  const { r, g, b, a = 1 } = rgb
  // Normalize RGB to 0–1
  const R = Math.max(0, Math.min(1, r / 255))
  const G = Math.max(0, Math.min(1, g / 255))
  const B = Math.max(0, Math.min(1, b / 255))
  const A = Math.max(0, Math.min(1, a))
  // Compute K (black)
  const K = 1 - Math.max(R, G, B)
  // Avoid division by zero
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const denom = 1 - K || 1
  // Compute C, M, Y
  const C = (1 - R - K) / denom
  const M = (1 - G - K) / denom
  const Y = (1 - B - K) / denom
  return {
    c: Math.round(C * 100),
    m: Math.round(M * 100),
    y: Math.round(Y * 100),
    k: Math.round(K * 100),
    a: A
  }
}

// Rgb ↔ XYZ
function _xyz2rgb (xyza: Xyza): Rgba {
  const { x, y, z, a = 1 } = xyza
  // Normalize XYZ to 0–1
  const X = x / 100
  const Y = y / 100
  const Z = z / 100
  const A = Math.max(0, Math.min(1, a))
  // XYZ → linear RGB (D65)
  let R = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314
  let G = X * -0.9692660 + Y * 1.8760108 + Z * 0.0415560
  let B = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252
  // Apply gamma correction
  const GAMMA_THRESHOLD = 0.0031308
  const GAMMA_EXPONENT = 1 / 2.4
  const GAMMA_MULT = 1.055
  const GAMMA_OFFSET = 0.055
  const LINEAR_DIVISOR = 12.92
  const gammaCorrect = (c: number): number => c <= GAMMA_THRESHOLD
    ? c * LINEAR_DIVISOR
    : GAMMA_MULT * Math.pow(c, GAMMA_EXPONENT) - GAMMA_OFFSET
  R = gammaCorrect(R)
  G = gammaCorrect(G)
  B = gammaCorrect(B)
  return {
    r: Math.round(Math.max(0, Math.min(1, R)) * 255),
    g: Math.round(Math.max(0, Math.min(1, G)) * 255),
    b: Math.round(Math.max(0, Math.min(1, B)) * 255),
    a: A
  }
}

function _rgb2xyz (rgb: Rgba): Xyza {
  const { r, g, b, a = 1 } = rgb
  // Normalize RGB to 0–1
  let R = Math.max(0, Math.min(1, r / 255))
  let G = Math.max(0, Math.min(1, g / 255))
  let B = Math.max(0, Math.min(1, b / 255))
  const A = Math.max(0, Math.min(1, a))
  // Apply inverse gamma correction (sRGB → linear)
  const SRGB_THRESHOLD = 0.04045
  const SRGB_OFFSET = 0.055
  const SRGB_DIVISOR = 1.055
  const SRGB_EXPONENT = 2.4
  const SRGB_LINEAR_DIVISOR = 12.92
  const linearize = (c: number): number => c > SRGB_THRESHOLD
    ? Math.pow((c + SRGB_OFFSET) / SRGB_DIVISOR, SRGB_EXPONENT)
    : c / SRGB_LINEAR_DIVISOR
  R = linearize(R)
  G = linearize(G)
  B = linearize(B)
  // Linear RGB → XYZ (D65)
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041
  return {
    x: X * 100,
    y: Y * 100,
    z: Z * 100,
    a: A
  }
}

// XYZ ↔ LAB
function _lab2xyz (lab: Laba): Xyza {
  const { l, a: A = 0, b: B = 0, al: alpha = 1 } = lab
  // D65 reference white
  const REF_X = 95.047
  const REF_Y = 100.0
  const REF_Z = 108.883
  const fy = (l + 16) / 116
  const fx = fy + A / 500
  const fz = fy - B / 200
  const fx3 = Math.pow(fx, 3)
  const fz3 = Math.pow(fz, 3)
  const fy3 = Math.pow(fy, 3)
  const epsilon = 0.008856 // CIE standard
  const kappa = 903.3 // CIE standard
  const X = fx3 > epsilon ? fx3 : (116 * fx - 16) / kappa
  const Y = l > (kappa * epsilon) ? fy3 : l / kappa
  const Z = fz3 > epsilon ? fz3 : (116 * fz - 16) / kappa
  return {
    x: X * REF_X,
    y: Y * REF_Y,
    z: Z * REF_Z,
    a: Math.max(0, Math.min(1, alpha))
  }
}

function _xyz2lab (xyza: Xyza): Laba {
  const { x, y, z, a: alpha = 1 } = xyza
  // D65 reference white
  const REF_X = 95.047
  const REF_Y = 100.0
  const REF_Z = 108.883
  const X = x / REF_X
  const Y = y / REF_Y
  const Z = z / REF_Z
  const epsilon = 0.008856 // CIE standard
  const kappa = 903.3 // CIE standard
  const fx = X > epsilon ? Math.cbrt(X) : (kappa * X + 16) / 116
  const fy = Y > epsilon ? Math.cbrt(Y) : (kappa * Y + 16) / 116
  const fz = Z > epsilon ? Math.cbrt(Z) : (kappa * Z + 16) / 116
  const L = 116 * fy - 16
  const A = 500 * (fx - fy)
  const B = 200 * (fy - fz)
  return {
    l: L,
    a: A,
    b: B,
    al: Math.max(0, Math.min(1, alpha))
  }
}

// LAB ↔ LCH
function _lab2lch (lab: Laba): Lcha {
  const { l, a, b, al = 1 } = lab
  const c = Math.sqrt(a * a + b * b)
  let h = Math.atan2(b, a) * (180 / Math.PI) // convert to degrees
  if (h < 0) h += 360
  return { l, c, h, a: al }
}

function _lch2lab (lch: Lcha): Laba {
  const { l, c, h, a = 1 } = lch
  const hRad = (h * Math.PI) / 180
  const A = c * Math.cos(hRad)
  const B = c * Math.sin(hRad)
  return { l, a: A, b: B, al: a }
}

/* * * * * * * * * * * * * * * * * *
 * Converters
 * * * * * * * * * * * * * * * * * */

/**
 * Converts any supported color format to RGBA.
 *
 * @param {Color} color - The color to convert.
 * @returns {Rgba} The color in RGBA format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toRgb (color: Color): Rgba {
  if (isRgb(color)) return color
  if (isHsl(color)) return _hsl2rgb(color)
  if (isHsb(color)) return _hsb2rgb(color)
  if (isCmyk(color)) return _cmyk2rgb(color)
  if (isCssColor(color)) return _css2rgb(color)
  if (isHex(color)) return _hex2rgb(color)
  if (isXyz(color)) return _xyz2rgb(color)
  if (isLab(color)) return _xyz2rgb(_lab2xyz(color))
  if (isLch(color)) return _xyz2rgb(_lab2xyz(_lch2lab(color)))
  throw new Error(`Invalid color input: ${unknownToString(color)}`)
}

/**
 * Converts any supported color format to CIE XYZ.
 *
 * @param {Color} color - The color to convert.
 * @returns {Xyza} The color in CIE XYZ format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toXyz (color: Color): Xyza {
  if (isXyz(color)) return color
  if (isLab(color)) return _lab2xyz(color)
  if (isLch(color)) return _lab2xyz(_lch2lab(color))
  if (isRgb(color)) return _rgb2xyz(color)
  if (isHsl(color)) return _rgb2xyz(_hsl2rgb(color))
  if (isHsb(color)) return _rgb2xyz(_hsb2rgb(color))
  if (isCmyk(color)) return _rgb2xyz(_cmyk2rgb(color))
  if (isCssColor(color)) return _rgb2xyz(_css2rgb(color))
  if (isHex(color)) return _rgb2xyz(_hex2rgb(color))
  throw new Error(`Invalid color input: ${unknownToString(color)}`)
}

/**
 * Converts any supported color format to CIELAB.
 *
 * @param {Color} color - The color to convert.
 * @returns {Laba} The color in CIELAB format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toLab (color: Color): Laba {
  if (isLab(color)) return color
  if (isLch(color)) return _lch2lab(color)
  const xyzColor = toXyz(color)
  return _xyz2lab(xyzColor)
}

/**
 * Converts any supported color format to CIELCh.
 *
 * @param {Color} color - The color to convert.
 * @returns {Lcha} The color in CIELCh format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toLch (color: Color): Lcha {
  if (isLch(color)) return color
  const labColor = toLab(color)
  return _lab2lch(labColor)
}

/**
 * Converts any supported color format to HSLA.
 *
 * @param {Color} color - The color to convert.
 * @returns {Hsla} The color in HSLA format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toHsl (color: Color): Hsla {
  if (isHsl(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2hsl(rgbColor)
}

/**
 * Converts any supported color format to HSBA (HSB/HSV).
 *
 * @param {Color} color - The color to convert.
 * @returns {Hsba} The color in HSBA format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toHsb (color: Color): Hsba {
  if (isHsb(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2hsb(rgbColor)
}

/**
 * Converts any supported color format to CMYK.
 *
 * @param {Color} color - The color to convert.
 * @returns {Cmyka} The color in CMYK format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toCmyk (color: Color): Cmyka {
  if (isCmyk(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2cmyk(rgbColor)
}

/**
 * Converts any supported color format to a CSS named color.
 *
 * @param {Color} color - The color to convert.
 * @returns {CssColor | undefined} The CSS named color if an exact match exists, otherwise undefined.
 */
export function toCss (color: CssColor): CssColor
export function toCss (color: Color): CssColor | undefined // [WIP] this overload may be unnecessary?
export function toCss (color: Color): CssColor | undefined {
  if (isCssColor(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2css(rgbColor)
}

/**
 * Converts any supported color format to hexadecimal.
 *
 * @param {Color} color - The color to convert.
 * @returns {Hex} The color in hexadecimal format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function toHex (color: Color): Hex {
  if (isHex(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2hex(rgbColor)
}

/* * * * * * * * * * * * * * * * * *
 * Transformers
 * * * * * * * * * * * * * * * * * */
/**
 * Transforms a color by converting it to RGBA, applying a transformation function,
 * then converting back to the original color format.
 *
 * @template C - The input color type.
 * @param {C} color - The color to transform.
 * @param {(rgb: Rgba) => Rgba} transformer - Function that transforms the RGBA representation.
 * @returns {TransformedColor<C>} The transformed color in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function viaRgb <C extends Color> (color: C, transformer: (rgb: Rgba) => Rgba): TransformedColor<C> {
  const _color: Color = color
  const rgb = toRgb(_color)
  const transformedRgb = transformer(rgb)
  if (isRgb(_color)) return transformedRgb as TransformedColor<C>
  if (isHsl(_color)) return toHsl(transformedRgb) as TransformedColor<C>
  if (isHsb(_color)) return toHsb(transformedRgb) as TransformedColor<C>
  if (isCmyk(_color)) return toCmyk(transformedRgb) as TransformedColor<C>
  if (isXyz(_color)) return toXyz(transformedRgb) as TransformedColor<C>
  if (isLab(_color)) return toLab(transformedRgb) as TransformedColor<C>
  if (isLch(_color)) return toLch(transformedRgb) as TransformedColor<C>
  if (isHex(_color)) return toRgb(transformedRgb) as TransformedColor<C>
  if (isCssColor(_color)) return transformedRgb as TransformedColor<C>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}

/**
 * Transforms a color by converting it to HSLA, applying a transformation function,
 * then converting back to the original color format.
 *
 * @template C - The input color type.
 * @param {C} color - The color to transform.
 * @param {(hsl: Hsla) => Hsla} transformer - Function that transforms the HSLA representation.
 * @returns {TransformedColor<C>} The transformed color in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function viaHsl <C extends Color> (color: C, transformer: (hsl: Hsla) => Hsla): TransformedColor<C> {
  const _color: Color = color
  const hsl = toHsl(_color)
  const transformedHsl = transformer(hsl)
  if (isHsl(_color)) return transformedHsl as TransformedColor<C>
  if (isRgb(_color)) return toRgb(transformedHsl) as TransformedColor<C>
  if (isHsb(_color)) return toHsb(transformedHsl) as TransformedColor<C>
  if (isCmyk(_color)) return toCmyk(transformedHsl) as TransformedColor<C>
  if (isXyz(_color)) return toXyz(transformedHsl) as TransformedColor<C>
  if (isLab(_color)) return toLab(transformedHsl) as TransformedColor<C>
  if (isLch(_color)) return toLch(transformedHsl) as TransformedColor<C>
  if (isHex(_color)) return toHex(transformedHsl) as TransformedColor<C>
  if (isCssColor(_color)) return transformedHsl as TransformedColor<C>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}

/**
 * Transforms a color by converting it to HSBA, applying a transformation function,
 * then converting back to the original color format.
 *
 * @template C - The input color type.
 * @param {C} color - The color to transform.
 * @param {(hsb: Hsba) => Hsba} transformer - Function that transforms the HSBA representation.
 * @returns {TransformedColor<C>} The transformed color in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function viaHsb <C extends Color> (color: C, transformer: (hsb: Hsba) => Hsba): TransformedColor<C> {
  const _color: Color = color
  const hsb = toHsb(_color)
  const transformedHsb = transformer(hsb)
  if (isHsb(_color)) return transformedHsb as TransformedColor<C>
  if (isRgb(_color)) return toRgb(transformedHsb) as TransformedColor<C>
  if (isHsl(_color)) return toHsl(transformedHsb) as TransformedColor<C>
  if (isCmyk(_color)) return toCmyk(transformedHsb) as TransformedColor<C>
  if (isXyz(_color)) return toXyz(transformedHsb) as TransformedColor<C>
  if (isLab(_color)) return toLab(transformedHsb) as TransformedColor<C>
  if (isLch(_color)) return toLch(transformedHsb) as TransformedColor<C>
  if (isHex(_color)) return toHex(transformedHsb) as TransformedColor<C>
  if (isCssColor(_color)) return transformedHsb as TransformedColor<C>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}

/**
 * Transforms a color by converting it to CMYK, applying a transformation function,
 * then converting back to the original color format.
 *
 * @template C - The input color type.
 * @param {C} color - The color to transform.
 * @param {(cmyk: Cmyka) => Cmyka} transformer - Function that transforms the CMYK representation.
 * @returns {TransformedColor<C>} The transformed color in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function viaCmyk <C extends Color> (color: C, transformer: (cmyk: Cmyka) => Cmyka): TransformedColor<C> {
  const _color: Color = color
  const cmyk = toCmyk(_color)
  const transformedCmyk = transformer(cmyk)
  if (isHsb(_color)) return transformedCmyk as TransformedColor<C>
  if (isRgb(_color)) return toRgb(transformedCmyk) as TransformedColor<C>
  if (isHsl(_color)) return toHsl(transformedCmyk) as TransformedColor<C>
  if (isCmyk(_color)) return toCmyk(transformedCmyk) as TransformedColor<C>
  if (isXyz(_color)) return toXyz(transformedCmyk) as TransformedColor<C>
  if (isLab(_color)) return toLab(transformedCmyk) as TransformedColor<C>
  if (isLch(_color)) return toLch(transformedCmyk) as TransformedColor<C>
  if (isHex(_color)) return toHex(transformedCmyk) as TransformedColor<C>
  if (isCssColor(_color)) return transformedCmyk as TransformedColor<C>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}

/**
 * Transforms a color by converting it to CIE XYZ, applying a transformation function,
 * then converting back to the original color format.
 *
 * @template C - The input color type.
 * @param {C} color - The color to transform.
 * @param {(xyz: Xyza) => Xyza} transformer - Function that transforms the XYZ representation.
 * @returns {TransformedColor<C>} The transformed color in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function viaXyz <C extends Color> (color: C, transformer: (xyz: Xyza) => Xyza): TransformedColor<C> {
  const _color: Color = color
  const xyz = toXyz(_color)
  const transformedXyz = transformer(xyz)
  if (isHsb(_color)) return transformedXyz as TransformedColor<C>
  if (isRgb(_color)) return toRgb(transformedXyz) as TransformedColor<C>
  if (isHsl(_color)) return toHsl(transformedXyz) as TransformedColor<C>
  if (isCmyk(_color)) return toCmyk(transformedXyz) as TransformedColor<C>
  if (isXyz(_color)) return toXyz(transformedXyz) as TransformedColor<C>
  if (isLab(_color)) return toLab(transformedXyz) as TransformedColor<C>
  if (isLch(_color)) return toLch(transformedXyz) as TransformedColor<C>
  if (isHex(_color)) return toHex(transformedXyz) as TransformedColor<C>
  if (isCssColor(_color)) return transformedXyz as TransformedColor<C>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}

/**
 * Transforms a color by converting it to CIELAB, applying a transformation function,
 * then converting back to the original color format.
 *
 * @template C - The input color type.
 * @param {C} color - The color to transform.
 * @param {(lab: Laba) => Laba} transformer - Function that transforms the CIELAB representation.
 * @returns {TransformedColor<C>} The transformed color in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function viaLab <C extends Color> (color: C, transformer: (lab: Laba) => Laba): TransformedColor<C> {
  const _color: Color = color
  const lab = toLab(_color)
  const transformedLab = transformer(lab)
  if (isHsb(_color)) return transformedLab as TransformedColor<C>
  if (isRgb(_color)) return toRgb(transformedLab) as TransformedColor<C>
  if (isHsl(_color)) return toHsl(transformedLab) as TransformedColor<C>
  if (isCmyk(_color)) return toCmyk(transformedLab) as TransformedColor<C>
  if (isXyz(_color)) return toXyz(transformedLab) as TransformedColor<C>
  if (isLab(_color)) return toLab(transformedLab) as TransformedColor<C>
  if (isLch(_color)) return toLch(transformedLab) as TransformedColor<C>
  if (isHex(_color)) return toHex(transformedLab) as TransformedColor<C>
  if (isCssColor(_color)) return transformedLab as TransformedColor<C>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}

/**
 * Transforms a color by converting it to CIELCh, applying a transformation function,
 * then converting back to the original color format.
 *
 * @template C - The input color type.
 * @param {C} color - The color to transform.
 * @param {(lch: Lcha) => Lcha} transformer - Function that transforms the CIELCh representation.
 * @returns {TransformedColor<C>} The transformed color in the original format.
 * @throws {Error} If the color format is invalid or unsupported.
 */
export function viaLch <C extends Color> (color: C, transformer: (lch: Lcha) => Lcha): TransformedColor<C> {
  const _color: Color = color
  const lch = toLch(_color)
  const transformedLch = transformer(lch)
  if (isHsb(_color)) return transformedLch as TransformedColor<C>
  if (isRgb(_color)) return toRgb(transformedLch) as TransformedColor<C>
  if (isHsl(_color)) return toHsl(transformedLch) as TransformedColor<C>
  if (isCmyk(_color)) return toCmyk(transformedLch) as TransformedColor<C>
  if (isXyz(_color)) return toXyz(transformedLch) as TransformedColor<C>
  if (isLab(_color)) return toLab(transformedLch) as TransformedColor<C>
  if (isLch(_color)) return toLch(transformedLch) as TransformedColor<C>
  if (isHex(_color)) return toHex(transformedLch) as TransformedColor<C>
  if (isCssColor(_color)) return transformedLch as TransformedColor<C>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${unknownToString(_color)}`)
}

/* * * * * * * * * * * * * * * * * *
 * sRGB linearization / delinearization
 * * * * * * * * * * * * * * * * * */

/**
 * Converts an RGBA color to linear sRGB color space by applying inverse gamma correction.
 *
 * @param {Rgba} rgb - The RGBA color to linearize.
 * @returns {Srgba} The linearized color in sRGB color space.
 */
export function linearizeToSRgb (rgb: Rgba): Srgba {
  const cleanRgb = tidy(rgb)
  const linearChannel = (v: number): number => {
    const n = v / 255
    if (n <= 0.04045) return n / 12.92
    else return Math.pow((n + 0.055) / 1.055, 2.4)
  }
  return {
    linearR: linearChannel(cleanRgb.r),
    linearG: linearChannel(cleanRgb.g),
    linearB: linearChannel(cleanRgb.b),
    a: cleanRgb.a
  }
}

/**
 * Converts a linear sRGB color to RGBA by applying gamma correction.
 *
 * @param {Srgba} srgb - The linear sRGB color to delinearize.
 * @returns {Rgba} The delinearized color in RGBA format.
 */
export function delinearizeToRgb (srgb: Srgba): Rgba {
  const gammaChannel = (v: number): number => {
    if (v <= 0.0031308) return v * 12.92
    else return 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  }
  return tidy({
    r: gammaChannel(srgb.linearR) * 255,
    g: gammaChannel(srgb.linearG) * 255,
    b: gammaChannel(srgb.linearB) * 255,
    a: srgb.a
  })
}
