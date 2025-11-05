import { isNonNullObject } from '../objects/is-object/index.js'
import { absoluteModulo } from '../numbers/absolute-modulo/index.js'
import { clamp } from '../numbers/clamp/index.js'

// export type Hex = string
export type Hex = `#${string}`
export type Rgba = {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
  a?: number // 0-1
}
export type Hsla = {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
  a?: number // 0-1
}
export type Hsba = {
  h: number // 0-360
  s: number // 0-100
  b: number // 0-100
  a?: number // 0-1
}
export type Laba = {
  l: number // 0–100
  a: number // env. -128–127
  b: number // env. -128–127
  al?: number // 0-1
}
export type Lcha = {
  l: number // 0–100
  c: number // 0–~150
  h: number // 0–360
  a?: number // 0-1
}
export type Cmyka = {
  c: number // 0–100
  m: number // 0–100
  y: number // 0–100
  k: number // 0–100
  a?: number // 0-1
}
export type Xyza = {
  x: number // env. 0–95.047
  y: number // env. 0–100
  z: number // env. 0–108.883
  a?: number // 0-1
}
export type CssColor = 'aliceblue' | 'antiquewhite' | 'aqua' | 'aquamarine' | 'azure' | 'beige' | 'bisque' | 'black' | 'blanchedalmond' | 'blue' | 'blueviolet' | 'brown' | 'burlywood' | 'cadetblue' | 'chartreuse' | 'chocolate' | 'coral' | 'cornflowerblue' | 'cornsilk' | 'crimson' | 'cyan' | 'darkblue' | 'darkcyan' | 'darkgoldenrod' | 'darkgray' | 'darkgreen' | 'darkgrey' | 'darkkhaki' | 'darkmagenta' | 'darkolivegreen' | 'darkorange' | 'darkorchid' | 'darkred' | 'darksalmon' | 'darkseagreen' | 'darkslateblue' | 'darkslategray' | 'darkslategrey' | 'darkturquoise' | 'darkviolet' | 'deeppink' | 'deepskyblue' | 'dimgray' | 'dimgrey' | 'dodgerblue' | 'firebrick' | 'floralwhite' | 'forestgreen' | 'fuchsia' | 'gainsboro' | 'ghostwhite' | 'gold' | 'goldenrod' | 'gray' | 'green' | 'greenyellow' | 'grey' | 'honeydew' | 'hotpink' | 'indianred' | 'indigo' | 'ivory' | 'khaki' | 'lavender' | 'lavenderblush' | 'lawngreen' | 'lemonchiffon' | 'lightblue' | 'lightcoral' | 'lightcyan' | 'lightgoldenrodyellow' | 'lightgray' | 'lightgreen' | 'lightgrey' | 'lightpink' | 'lightsalmon' | 'lightseagreen' | 'lightskyblue' | 'lightslategray' | 'lightslategrey' | 'lightsteelblue' | 'lightyellow' | 'lime' | 'limegreen' | 'linen' | 'magenta' | 'maroon' | 'mediumaquamarine' | 'mediumblue' | 'mediumorchid' | 'mediumpurple' | 'mediumseagreen' | 'mediumslateblue' | 'mediumspringgreen' | 'mediumturquoise' | 'mediumvioletred' | 'midnightblue' | 'mintcream' | 'mistyrose' | 'moccasin' | 'navajowhite' | 'navy' | 'oldlace' | 'olive' | 'olivedrab' | 'orange' | 'orangered' | 'orchid' | 'palegoldenrod' | 'palegreen' | 'paleturquoise' | 'palevioletred' | 'papayawhip' | 'peachpuff' | 'peru' | 'pink' | 'plum' | 'powderblue' | 'purple' | 'rebeccapurple' | 'red' | 'rosybrown' | 'royalblue' | 'saddlebrown' | 'salmon' | 'sandybrown' | 'seagreen' | 'seashell' | 'sienna' | 'silver' | 'skyblue' | 'slateblue' | 'slategray' | 'slategrey' | 'snow' | 'springgreen' | 'steelblue' | 'tan' | 'teal' | 'thistle' | 'tomato' | 'turquoise' | 'violet' | 'wheat' | 'white' | 'whitesmoke' | 'yellow' | 'yellowgreen'

type CssColorMap = { [K in CssColor]: Rgba }

export const cssColors: CssColorMap = {
  aliceblue: { r: 240, g: 248, b: 255 },
  antiquewhite: { r: 250, g: 235, b: 215 },
  aqua: { r: 0, g: 255, b: 255 },
  aquamarine: { r: 127, g: 255, b: 212 },
  azure: { r: 240, g: 255, b: 255 },
  beige: { r: 245, g: 245, b: 220 },
  bisque: { r: 255, g: 228, b: 196 },
  black: { r: 0, g: 0, b: 0 },
  blanchedalmond: { r: 255, g: 235, b: 205 },
  blue: { r: 0, g: 0, b: 255 },
  blueviolet: { r: 138, g: 43, b: 226 },
  brown: { r: 165, g: 42, b: 42 },
  burlywood: { r: 222, g: 184, b: 135 },
  cadetblue: { r: 95, g: 158, b: 160 },
  chartreuse: { r: 127, g: 255, b: 0 },
  chocolate: { r: 210, g: 105, b: 30 },
  coral: { r: 255, g: 127, b: 80 },
  cornflowerblue: { r: 100, g: 149, b: 237 },
  cornsilk: { r: 255, g: 248, b: 220 },
  crimson: { r: 220, g: 20, b: 60 },
  cyan: { r: 0, g: 255, b: 255 },
  darkblue: { r: 0, g: 0, b: 139 },
  darkcyan: { r: 0, g: 139, b: 139 },
  darkgoldenrod: { r: 184, g: 134, b: 11 },
  darkgray: { r: 169, g: 169, b: 169 },
  darkgreen: { r: 0, g: 100, b: 0 },
  darkgrey: { r: 169, g: 169, b: 169 },
  darkkhaki: { r: 189, g: 183, b: 107 },
  darkmagenta: { r: 139, g: 0, b: 139 },
  darkolivegreen: { r: 85, g: 107, b: 47 },
  darkorange: { r: 255, g: 140, b: 0 },
  darkorchid: { r: 153, g: 50, b: 204 },
  darkred: { r: 139, g: 0, b: 0 },
  darksalmon: { r: 233, g: 150, b: 122 },
  darkseagreen: { r: 143, g: 188, b: 143 },
  darkslateblue: { r: 72, g: 61, b: 139 },
  darkslategray: { r: 47, g: 79, b: 79 },
  darkslategrey: { r: 47, g: 79, b: 79 },
  darkturquoise: { r: 0, g: 206, b: 209 },
  darkviolet: { r: 148, g: 0, b: 211 },
  deeppink: { r: 255, g: 20, b: 147 },
  deepskyblue: { r: 0, g: 191, b: 255 },
  dimgray: { r: 105, g: 105, b: 105 },
  dimgrey: { r: 105, g: 105, b: 105 },
  dodgerblue: { r: 30, g: 144, b: 255 },
  firebrick: { r: 178, g: 34, b: 34 },
  floralwhite: { r: 255, g: 250, b: 240 },
  forestgreen: { r: 34, g: 139, b: 34 },
  fuchsia: { r: 255, g: 0, b: 255 },
  gainsboro: { r: 220, g: 220, b: 220 },
  ghostwhite: { r: 248, g: 248, b: 255 },
  gold: { r: 255, g: 215, b: 0 },
  goldenrod: { r: 218, g: 165, b: 32 },
  gray: { r: 128, g: 128, b: 128 },
  green: { r: 0, g: 128, b: 0 },
  greenyellow: { r: 173, g: 255, b: 47 },
  grey: { r: 128, g: 128, b: 128 },
  honeydew: { r: 240, g: 255, b: 240 },
  hotpink: { r: 255, g: 105, b: 180 },
  indianred: { r: 205, g: 92, b: 92 },
  indigo: { r: 75, g: 0, b: 130 },
  ivory: { r: 255, g: 255, b: 240 },
  khaki: { r: 240, g: 230, b: 140 },
  lavender: { r: 230, g: 230, b: 250 },
  lavenderblush: { r: 255, g: 240, b: 245 },
  lawngreen: { r: 124, g: 252, b: 0 },
  lemonchiffon: { r: 255, g: 250, b: 205 },
  lightblue: { r: 173, g: 216, b: 230 },
  lightcoral: { r: 240, g: 128, b: 128 },
  lightcyan: { r: 224, g: 255, b: 255 },
  lightgoldenrodyellow: { r: 250, g: 250, b: 210 },
  lightgray: { r: 211, g: 211, b: 211 },
  lightgreen: { r: 144, g: 238, b: 144 },
  lightgrey: { r: 211, g: 211, b: 211 },
  lightpink: { r: 255, g: 182, b: 193 },
  lightsalmon: { r: 255, g: 160, b: 122 },
  lightseagreen: { r: 32, g: 178, b: 170 },
  lightskyblue: { r: 135, g: 206, b: 250 },
  lightslategray: { r: 119, g: 136, b: 153 },
  lightslategrey: { r: 119, g: 136, b: 153 },
  lightsteelblue: { r: 176, g: 196, b: 222 },
  lightyellow: { r: 255, g: 255, b: 224 },
  lime: { r: 0, g: 255, b: 0 },
  limegreen: { r: 50, g: 205, b: 50 },
  linen: { r: 250, g: 240, b: 230 },
  magenta: { r: 255, g: 0, b: 255 },
  maroon: { r: 128, g: 0, b: 0 },
  mediumaquamarine: { r: 102, g: 205, b: 170 },
  mediumblue: { r: 0, g: 0, b: 205 },
  mediumorchid: { r: 186, g: 85, b: 211 },
  mediumpurple: { r: 147, g: 112, b: 219 },
  mediumseagreen: { r: 60, g: 179, b: 113 },
  mediumslateblue: { r: 123, g: 104, b: 238 },
  mediumspringgreen: { r: 0, g: 250, b: 154 },
  mediumturquoise: { r: 72, g: 209, b: 204 },
  mediumvioletred: { r: 199, g: 21, b: 133 },
  midnightblue: { r: 25, g: 25, b: 112 },
  mintcream: { r: 245, g: 255, b: 250 },
  mistyrose: { r: 255, g: 228, b: 225 },
  moccasin: { r: 255, g: 228, b: 181 },
  navajowhite: { r: 255, g: 222, b: 173 },
  navy: { r: 0, g: 0, b: 128 },
  oldlace: { r: 253, g: 245, b: 230 },
  olive: { r: 128, g: 128, b: 0 },
  olivedrab: { r: 107, g: 142, b: 35 },
  orange: { r: 255, g: 165, b: 0 },
  orangered: { r: 255, g: 69, b: 0 },
  orchid: { r: 218, g: 112, b: 214 },
  palegoldenrod: { r: 238, g: 232, b: 170 },
  palegreen: { r: 152, g: 251, b: 152 },
  paleturquoise: { r: 175, g: 238, b: 238 },
  palevioletred: { r: 219, g: 112, b: 147 },
  papayawhip: { r: 255, g: 239, b: 213 },
  peachpuff: { r: 255, g: 218, b: 185 },
  peru: { r: 205, g: 133, b: 63 },
  pink: { r: 255, g: 192, b: 203 },
  plum: { r: 221, g: 160, b: 221 },
  powderblue: { r: 176, g: 224, b: 230 },
  purple: { r: 128, g: 0, b: 128 },
  rebeccapurple: { r: 102, g: 51, b: 153 },
  red: { r: 255, g: 0, b: 0 },
  rosybrown: { r: 188, g: 143, b: 143 },
  royalblue: { r: 65, g: 105, b: 225 },
  saddlebrown: { r: 139, g: 69, b: 19 },
  salmon: { r: 250, g: 128, b: 114 },
  sandybrown: { r: 244, g: 164, b: 96 },
  seagreen: { r: 46, g: 139, b: 87 },
  seashell: { r: 255, g: 245, b: 238 },
  sienna: { r: 160, g: 82, b: 45 },
  silver: { r: 192, g: 192, b: 192 },
  skyblue: { r: 135, g: 206, b: 235 },
  slateblue: { r: 106, g: 90, b: 205 },
  slategray: { r: 112, g: 128, b: 144 },
  slategrey: { r: 112, g: 128, b: 144 },
  snow: { r: 255, g: 250, b: 250 },
  springgreen: { r: 0, g: 255, b: 127 },
  steelblue: { r: 70, g: 130, b: 180 },
  tan: { r: 210, g: 180, b: 140 },
  teal: { r: 0, g: 128, b: 128 },
  thistle: { r: 216, g: 191, b: 216 },
  tomato: { r: 255, g: 99, b: 71 },
  turquoise: { r: 64, g: 224, b: 208 },
  violet: { r: 238, g: 130, b: 238 },
  wheat: { r: 245, g: 222, b: 179 },
  white: { r: 255, g: 255, b: 255 },
  whitesmoke: { r: 245, g: 245, b: 245 },
  yellow: { r: 255, g: 255, b: 0 },
  yellowgreen: { r: 154, g: 205, b: 50 }
}

export type Color = Hex | Rgba | Hsla | Hsba | Laba | Lcha | Cmyka | Xyza | CssColor

export type TransformedColor<C extends Color> = C extends CssColor ? Rgba
  : C extends Hex ? Hex
    : C extends Rgba ? Rgba
      : C extends Hsla ? Hsla
        : C extends Hsba ? Hsba
          : C extends Cmyka ? Cmyka
            : C extends Xyza ? Xyza
              : C extends Laba ? Laba
                : C extends Lcha ? Lcha
                  : never

/* * * * * * * * * * * * * * * * * *
 * Typechecks
 * * * * * * * * * * * * * * * * * */

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


/* * * * * * * * * * * * * * * * * *
 * Convertion building blocks
 * * * * * * * * * * * * * * * * * */

// RGB ↔ Hex
// [WIP] maybe use absoluteModulo where needed?
// needs rewrite, hex char checks, etc
function _hex2rgb (hex: Hex): Rgba {
  if (!isHex(hex)) throw new Error(`invalid hex color ${hex}`)
  let hexString: string = hex
  const inputHex = hexString
  const startsWithHash = hexString.startsWith('#')
  if (!startsWithHash) throw new Error(`invalid hex color ${inputHex}`)
  hexString = hexString.slice(1)
  if (hexString.length === 3) { hexString = hexString.split('').map(c => c + c).join('') + 'ff' }
  else if (hexString.length === 4) { hexString = hexString.split('').map(c => c + c).join('') }
  else if (hexString.length === 6) { hexString = hexString + 'ff' }
  else if (hexString.length === 8) { hexString = hexString }
  else throw new Error(`invalid hex color ${inputHex}`)
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
    throw new Error(`invalid hex color output ${returned}`)
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
    if (max === R) { h = ((G - B) / delta + (G < B ? 6 : 0)) / 6 }
    else if (max === G) { h = ((B - R) / delta + 2) / 6 }
    else { h = ((R - G) / delta + 4) / 6 }
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
    if (max === R) { h = ((G - B) / delta + (G < B ? 6 : 0)) / 6 }
    else if (max === G) { h = ((B - R) / delta + 2) / 6 }
    else { h = ((R - G) / delta + 4) / 6 }
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
  let R =  X *  3.2404542 + Y * -1.5371385 + Z * -0.4985314
  let G =  X * -0.9692660 + Y *  1.8760108 + Z *  0.0415560
  let B =  X *  0.0556434 + Y * -0.2040259 + Z *  1.0572252
  // Apply gamma correction
  const GAMMA_THRESHOLD = 0.0031308
  const GAMMA_EXPONENT = 1 / 2.4
  const GAMMA_MULT = 1.055
  const GAMMA_OFFSET = 0.055
  const LINEAR_DIVISOR = 12.92
  const gammaCorrect = (c: number) => c <= GAMMA_THRESHOLD
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
  const linearize = (c: number) => c > SRGB_THRESHOLD
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
  const kappa = 903.3      // CIE standard
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
  const kappa = 903.3      // CIE standard
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
  throw new Error(`Invalid color input: ${color}`)
}

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
  throw new Error(`Invalid color input: ${color}`)
}

export function toLab (color: Color): Laba {
  if (isLab(color)) return color
  if (isLch(color)) return _lch2lab(color)
  const xyzColor = toXyz(color)
  return _xyz2lab(xyzColor)
}

export function toLch (color: Color): Lcha {
  if (isLch(color)) return color
  const labColor = toLab(color)
  return _lab2lch(labColor)
}

export function toHsl (color: Color): Hsla {
  if (isHsl(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2hsl(rgbColor)
}

export function toHsb (color: Color): Hsba {
  if (isHsb(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2hsb(rgbColor)
}

export function toCmyk (color: Color): Cmyka {
  if (isCmyk(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2cmyk(rgbColor)
}

export function toCss (color: CssColor): CssColor
export function toCss (color: Color): CssColor | undefined // [WIP] this overload may be unnecessary?
export function toCss (color: Color): CssColor | undefined {
  if (isCssColor(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2css(rgbColor)
}

export function toHex (color: Color): Hex {
  if (isHex(color)) return color
  const rgbColor = toRgb(color)
  return _rgb2hex(rgbColor)
}

/* * * * * * * * * * * * * * * * * *
 * Transformers
 * * * * * * * * * * * * * * * * * */
export function viaRgb <C extends Color>(color: C, transformer: (rgb: Rgba) => Rgba): TransformedColor<C> {
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
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

export function viaHsl <C extends Color>(color: C, transformer: (hsl: Hsla) => Hsla): TransformedColor<C> {
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
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

export function viaHsb <C extends Color>(color: C, transformer: (hsb: Hsba) => Hsba): TransformedColor<C> {
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
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

export function viaCmyk <C extends Color>(color: C, transformer: (cmyk: Cmyka) => Cmyka): TransformedColor<C> {
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
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

export function viaXyz <C extends Color>(color: C, transformer: (xyz: Xyza) => Xyza): TransformedColor<C> {
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
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

export function viaLab <C extends Color>(color: C, transformer: (lab: Laba) => Laba): TransformedColor<C> {
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
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

export function viaLch <C extends Color>(color: C, transformer: (lch: Lcha) => Lcha): TransformedColor<C> {
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
  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

/* * * * * * * * * * * * * * * * * *
 * Tidy
 * * * * * * * * * * * * * * * * * */
export function tidy <C extends Color>(color: C): TransformedColor<C> {
  const _color: Color = color
  
  if (isRgb(_color)) return {
    r: clamp(_color.r, 0, 255),
    g: clamp(_color.g, 0, 255),
    b: clamp(_color.b, 0, 255),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isHsl(_color)) return {
    h: absoluteModulo(_color.h, 360),
    s: clamp(_color.s, 0, 100),
    l: clamp(_color.l, 0, 100),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isHsb(_color)) return {
    h: absoluteModulo(_color.h, 360),
    s: clamp(_color.s, 0, 100),
    b: clamp(_color.b, 0, 100),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isCmyk(_color)) return {
    c: clamp(_color.c, 0, 100),
    m: clamp(_color.m, 0, 100),
    y: clamp(_color.y, 0, 100),
    k: clamp(_color.k, 0, 100),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isXyz(_color)) return {
    x: _color.x,
    y: _color.y,
    z: _color.z,
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isLab(_color)) return {
    l: clamp(_color.l, 0, 100),
    a: _color.a,
    b: _color.b,
    al: clamp(_color.al ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isLch(_color)) return {
    l: clamp(_color.l, 0, 100),
    c: Math.max(0, _color.c),
    h: clamp(_color.h, 0, 360),
    a: clamp(_color.a ?? 1, 0, 1)
  } as TransformedColor<C>

  if (isCssColor(_color)) return tidy(toRgb(_color)) as TransformedColor<C>
  if (isHex(_color)) return toHex(tidy(toRgb(_color))) as TransformedColor<C>

  const _typecheck: typeof _color extends never ? true : false = true
  throw new Error(`Invalid color input: ${_color}`)
}

/* * * * * * * * * * * * * * * * * *
 * Set channel
 * * * * * * * * * * * * * * * * * */

export type Channel = 'red' | 'green' | 'blue' | 'alpha' | 'hue' | 'saturation' | 'lightness' | 'brightness' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'x' | 'y' | 'z' | 'lightnessLab' | 'aLab' | 'bLab' | 'chroma' | 'hueLch'

export function setChannel <C extends Color>(color: C, channel: Channel, value: number): TransformedColor<C> {
  switch (channel) {
    case 'red': return viaRgb(color, rgb => ({ ...rgb, r: clamp(value, 0, 255) }))
    case 'green': return viaRgb(color, rgb => ({ ...rgb, g: clamp(value, 0, 255) }))
    case 'blue': return viaRgb(color, rgb => ({ ...rgb, b: clamp(value, 0, 255) }))
    case 'hue': return viaHsl(color, hsl => ({ ...hsl, h: absoluteModulo(value, 360) }))
    case 'saturation': return viaHsl(color, hsl => ({ ...hsl, s: clamp(value, 0, 100) }))
    case 'lightness': return viaHsl(color, hsl => ({ ...hsl, l: clamp(value, 0, 100) }))
    case 'brightness': return viaHsb(color, hsb => ({ ...hsb, b: clamp(value, 0, 100) }))
    case 'alpha': return viaRgb(color, rgb => ({ ...rgb, a: clamp(value, 0, 1) }))
    case 'cyan': return viaCmyk(color, cmyk => ({ ...cmyk, c: clamp(value, 0, 100) }))
    case 'magenta': return viaCmyk(color, cmyk => ({ ...cmyk, m: clamp(value, 0, 100) }))
    case 'yellow': return viaCmyk(color, cmyk => ({ ...cmyk, y: clamp(value, 0, 100) }))
    case 'black': return viaCmyk(color, cmyk => ({ ...cmyk, k: clamp(value, 0, 100) }))
    case 'x': return viaXyz(color, xyz => ({ ...xyz, x: value }))
    case 'y': return viaXyz(color, xyz => ({ ...xyz, y: value }))
    case 'z': return viaXyz(color, xyz => ({ ...xyz, z: value }))
    case 'lightnessLab': return viaLab(color, lab => ({ ...lab, a: clamp(value, 0, 100) }))
    case 'aLab': return viaLab(color, lab => ({ ...lab, a: value }))
    case 'bLab': return viaLab(color, lab => ({ ...lab, b: value }))
    case 'chroma': return viaLch(color, lch => ({ ...lch, c: Math.max(0, value) }))
    case 'hueLch': return viaLch(color, lch => ({ ...lch, h: clamp(value, 0, 360) }))  
  }
}

/* * * * * * * * * * * * * * * * * *
 * Get channel
 * * * * * * * * * * * * * * * * * */
export function getChannel (color: Color, channel: Channel): number {
  switch (channel) {
    case 'red': return toRgb(color).r
    case 'green': return toRgb(color).g
    case 'blue': return toRgb(color).b
    case 'hue': return toHsl(color).h
    case 'saturation': return toHsl(color).s
    case 'lightness': return toHsl(color).l
    case 'brightness': return toHsb(color).b
    case 'alpha': return toRgb(color).a ?? 1
    case 'cyan': return toCmyk(color).c
    case 'magenta': return toCmyk(color).m
    case 'yellow': return toCmyk(color).y
    case 'black': return toCmyk(color).k
    case 'x': return toXyz(color).x
    case 'y': return toXyz(color).y
    case 'z': return toXyz(color).z
    case 'lightnessLab': return toLab(color).l
    case 'aLab': return toLab(color).a
    case 'bLab': return toLab(color).b
    case 'chroma': return toLch(color).c
    case 'hueLch': return toLch(color).h 
  }
}

/* * * * * * * * * * * * * * * * * *
 * Add channel
 * * * * * * * * * * * * * * * * * */
export function addChannel <C extends Color>(color: C, channel: Channel, amount: number): TransformedColor<C> {
  switch (channel) {
    case 'red': return viaRgb(color, rgb => ({ ...rgb, r: clamp(rgb.r + amount, 0, 255) }))
    case 'green': return viaRgb(color, rgb => ({ ...rgb, g: clamp(rgb.g + amount, 0, 255) }))
    case 'blue': return viaRgb(color, rgb => ({ ...rgb, b: clamp(rgb.b + amount, 0, 255) }))
    case 'hue': return viaHsl(color, hsl => ({ ...hsl, h: absoluteModulo(hsl.h + amount, 360) }))
    case 'saturation': return viaHsl(color, hsl => ({ ...hsl, s: clamp(hsl.s + amount, 0, 100) }))
    case 'lightness': return viaHsl(color, hsl => ({ ...hsl, l: clamp(hsl.l + amount, 0, 100) }))
    case 'brightness': return viaHsb(color, hsb => ({ ...hsb, b: clamp(hsb.b + amount, 0, 100) }))
    case 'alpha': return viaRgb(color, rgb => ({ ...rgb, a: clamp(rgb.a ?? 1 + amount, 0, 1) }))
    case 'cyan': return viaCmyk(color, cmyk => ({ ...cmyk, c: clamp(cmyk.c + amount, 0, 100) }))
    case 'magenta': return viaCmyk(color, cmyk => ({ ...cmyk, m: clamp(cmyk.m + amount, 0, 100) }))
    case 'yellow': return viaCmyk(color, cmyk => ({ ...cmyk, y: clamp(cmyk.y + amount, 0, 100) }))
    case 'black': return viaCmyk(color, cmyk => ({ ...cmyk, k: clamp(cmyk.k + amount, 0, 100) }))
    case 'x': return viaXyz(color, xyz => ({ ...xyz, x: xyz.x + amount }))
    case 'y': return viaXyz(color, xyz => ({ ...xyz, y: xyz.y + amount }))
    case 'z': return viaXyz(color, xyz => ({ ...xyz, z: xyz.z + amount }))
    case 'lightnessLab': return viaLab(color, lab => ({ ...lab, l: clamp(lab.l + amount, 0, 100) }))
    case 'aLab': return viaLab(color, lab => ({ ...lab, a: lab.a + amount }))
    case 'bLab': return viaLab(color, lab => ({ ...lab, b: lab.b + amount }))
    case 'chroma': return viaLch(color, lch => ({ ...lch, c: Math.max(0, lch.c + amount) }))
    case 'hueLch': return viaLch(color, lch => ({ ...lch, h: clamp(lch.h + amount, 0, 360) }))
  }
}

/* * * * * * * * * * * * * * * * * *
 * Mult channel
 * * * * * * * * * * * * * * * * * */
export function multChannel <C extends Color>(color: C, channel: Channel, factor: number): TransformedColor<C> {
  switch (channel) {
    case 'red': return viaRgb(color, rgb => ({ ...rgb, r: clamp(rgb.r * factor, 0, 255) }))
    case 'green': return viaRgb(color, rgb => ({ ...rgb, g: clamp(rgb.g * factor, 0, 255) }))
    case 'blue': return viaRgb(color, rgb => ({ ...rgb, b: clamp(rgb.b * factor, 0, 255) }))
    case 'hue': return viaHsl(color, hsl => ({ ...hsl, h: absoluteModulo(hsl.h * factor, 360) }))
    case 'saturation': return viaHsl(color, hsl => ({ ...hsl, s: clamp(hsl.s * factor, 0, 100) }))
    case 'lightness': return viaHsl(color, hsl => ({ ...hsl, l: clamp(hsl.l * factor, 0, 100) }))
    case 'brightness': return viaHsb(color, hsb => ({ ...hsb, b: clamp(hsb.b * factor, 0, 100) }))
    case 'alpha': return viaRgb(color, rgb => ({ ...rgb, a: clamp(rgb.a ?? 1 * factor, 0, 1) }))
    case 'cyan': return viaCmyk(color, cmyk => ({ ...cmyk, c: clamp(cmyk.c * factor, 0, 100) }))
    case 'magenta': return viaCmyk(color, cmyk => ({ ...cmyk, m: clamp(cmyk.m * factor, 0, 100) }))
    case 'yellow': return viaCmyk(color, cmyk => ({ ...cmyk, y: clamp(cmyk.y * factor, 0, 100) }))
    case 'black': return viaCmyk(color, cmyk => ({ ...cmyk, k: clamp(cmyk.k * factor, 0, 100) }))
    case 'x': return viaXyz(color, xyz => ({ ...xyz, x: xyz.x * factor }))
    case 'y': return viaXyz(color, xyz => ({ ...xyz, y: xyz.y * factor }))
    case 'z': return viaXyz(color, xyz => ({ ...xyz, z: xyz.z * factor }))
    case 'lightnessLab': return viaLab(color, lab => ({ ...lab, l: clamp(lab.l * factor, 0, 100) }))
    case 'aLab': return viaLab(color, lab => ({ ...lab, a: lab.a * factor }))
    case 'bLab': return viaLab(color, lab => ({ ...lab, b: lab.b * factor }))
    case 'chroma': return viaLch(color, lch => ({ ...lch, c: Math.max(0, lch.c * factor) }))
    case 'hueLch': return viaLch(color, lch => ({ ...lch, h: clamp(lch.h * factor, 0, 360) })) 
  }
}

/* * * * * * * * * * * * * * * * * *
 * Invert
 * * * * * * * * * * * * * * * * * */
function invertRgb <C extends Color>(color: C): TransformedColor<C> {
  return viaRgb(color, rgb => ({
    ...rgb,
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  }))
}

function invertLab <C extends Color>(color: C): TransformedColor<C> {
  return viaLab(color, lab => ({
    ...lab,
    l: 100 - lab.l,
    a: -1 * lab.a,
    b: -1 * lab.b
  }))
}

function invertLch <C extends Color>(color: C): TransformedColor<C> {
  return viaLch(color, lch => ({
    ...lch,
    l: 100 - lch.l,
    h: absoluteModulo(lch.h + 180, 360)
  }))
}

type InvertMethod = 'rgb' | 'lab' | 'lch'

export function invert <C extends Color>(color: C, method: InvertMethod = 'lch'): TransformedColor<C> {
  switch (method) {
    case 'rgb': return invertRgb(color)
    case 'lab': return invertLab(color)
    case 'lch': return invertLch(color)
  }
}

/* * * * * * * * * * * * * * * * * *
 * Rotate
 * * * * * * * * * * * * * * * * * */
function rotateHsl <C extends Color>(color: C, degrees: number): TransformedColor<C> {
  return addChannel(color, 'hue', degrees)
}

function rotateLab <C extends Color>(color: C, degrees: number): TransformedColor<C> {
  return viaLab(color, lab => {
    const hue = Math.atan2(lab.b, lab.a) * (180 / Math.PI)
    const chroma = Math.sqrt(lab.a ** 2 + lab.b ** 2)
    const newHue = absoluteModulo(hue + degrees, 360)
    const rad = newHue * (Math.PI / 180)
    return {
      ...lab,
      a: chroma * Math.cos(rad),
      b: chroma * Math.sin(rad)
    }
  })
}

function rotateLch <C extends Color>(color: C, degrees: number): TransformedColor<C> {
  return viaLch(color, lch => ({
    ...lch,
    h: absoluteModulo(lch.h + degrees, 360)
  }))
}

type RotateMethod = 'hsl' | 'lab' | 'lch'
export function rotate <C extends Color>(
  color: C,
  degrees: number,
  method: RotateMethod = 'hsl'
): TransformedColor<C> {
  switch (method) {
    case 'hsl': return rotateHsl(color, degrees)
    case 'lab': return rotateLab(color, degrees)
    case 'lch': return rotateLch(color, degrees)
  }
}

/* * * * * * * * * * * * * * * * * *
 * Complementary
 * * * * * * * * * * * * * * * * * */
function complementaryHsl <C extends Color>(color: C): TransformedColor<C> {
  return rotateHsl(color, 180)
}

function complementaryLab <C extends Color>(color: C): TransformedColor<C> {
  return rotateLab(color, 180)
}

function complementaryLch <C extends Color>(color: C): TransformedColor<C> {
  return rotateLch(color, 180)
}

/* * * * * * * * * * * * * * * * * *
 * Split Complementary
 * * * * * * * * * * * * * * * * * */
function splitComplementaryHsl <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateHsl(color, 150),
    rotateHsl(color, 210)
  ]
}

function splitComplementaryLab <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateLab(color, 150),
    rotateLab(color, 210)
  ]
}

function splitComplementaryLch <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateLch(color, 150),
    rotateLch(color, 210)
  ]
}

/* * * * * * * * * * * * * * * * * *
 * Triadic
 * * * * * * * * * * * * * * * * * */
function triadicHsl <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateHsl(color, 120),
    rotateHsl(color, 240)
  ]
}

function triadicLab <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateLab(color, 120),
    rotateLab(color, 240)
  ]
}

function triadicLch <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateLch(color, 120),
    rotateLch(color, 240)
  ]
}

/* * * * * * * * * * * * * * * * * *
 * Tetradic
 * * * * * * * * * * * * * * * * * */
function tetradicHsl <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateHsl(color, 90),
    rotateHsl(color, 180),
    rotateHsl(color, 270)
  ]
}

function tetradicLab <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateLab(color, 90),
    rotateLab(color, 180),
    rotateLab(color, 270)
  ]
}

function tetradicLch <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>] {
  return [
    rotateLch(color, 90),
    rotateLch(color, 180),
    rotateLch(color, 270)
  ]
}

type PaletteMap<C extends Color> = {
  'complementary': readonly [TransformedColor<C>]
  'complementary-lab': readonly [TransformedColor<C>]
  'complementary-lch': readonly [TransformedColor<C>]
  'split-complementary': readonly [TransformedColor<C>, TransformedColor<C>]
  'split-complementary-lab': readonly [TransformedColor<C>, TransformedColor<C>]
  'split-complementary-lch': readonly [TransformedColor<C>, TransformedColor<C>]
  'triadic': readonly [TransformedColor<C>, TransformedColor<C>]
  'triadic-lab': readonly [TransformedColor<C>, TransformedColor<C>]
  'triadic-lch': readonly [TransformedColor<C>, TransformedColor<C>]
  'tetradic': readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>]
  'tetradic-lab': readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>]
  'tetradic-lch': readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>]
}

type Palette<C extends Color, T extends keyof PaletteMap<C>> = PaletteMap<C>[T]

export function palette<
  C extends Color,
  T extends keyof PaletteMap<C>
>(
  color: C,
  type: T
): Palette<C, T> {
  switch (type) {
    case 'complementary': return [complementaryHsl(color)] as const as Palette<C, T>
    case 'complementary-lab': return [complementaryLab(color)] as const as Palette<C, T>
    case 'complementary-lch': return [complementaryLch(color)] as const as Palette<C, T>
    case 'split-complementary': return splitComplementaryHsl(color) as Palette<C, T>
    case 'split-complementary-lab': return splitComplementaryLab(color)as Palette<C, T>
    case 'split-complementary-lch': return splitComplementaryLch(color)as Palette<C, T>
    case 'triadic': return triadicHsl(color)as Palette<C, T>
    case 'triadic-lab': return triadicLab(color)as Palette<C, T>
    case 'triadic-lch': return triadicLch(color)as Palette<C, T>
    case 'tetradic': return tetradicHsl(color)as Palette<C, T>
    case 'tetradic-lab': return tetradicLab(color)as Palette<C, T>
    case 'tetradic-lch': return tetradicLch(color)as Palette<C, T>
  }
}

/* * * * * * * * * * * * * * * * * *
 * Grayscales
 * * * * * * * * * * * * * * * * * */

// RGB
function avgGrayscaleRgb (rgb: Rgba): Rgba {
  const { r, g, b } = rgb
  const avg = (r + g + b) / 3
  return { ...rgb, r: avg, g: avg, b: avg }
}

function weightedAvgGrayscaleRgb (rgb: Rgba): Rgba {
  const { r, g, b } = rgb
  const avg = (r * 0.2126 + g * 0.7152 + b * 0.0722)
  return { ...rgb, r: avg, g: avg, b: avg }
}

function minChannelGrayscaleRgb (rgb: Rgba): Rgba {
  const { r, g, b } = rgb
  const min = Math.min(r, g, b)
  return { ...rgb, r: min, g: min, b: min }
}

function maxChannelGrayscaleRgb (rgb: Rgba): Rgba {
  const { r, g, b } = rgb
  const max = Math.max(r, g, b)
  return { ...rgb, r: max, g: max, b: max }
}

function grayscaleRgbVia (rgb: Rgba, channel: 'red' | 'green' | 'blue'): Rgba {
  const { r, g, b } = rgb
  switch (channel) {
    case 'red': return { ...rgb, r, g: r, b: r }
    case 'green': return { ...rgb, r: g, g, b: g }
    case 'blue': return { ...rgb, r: b, g: b, b }
  }
}

// CMYK
function avgGrayscaleCmyk (cmyk: Cmyka): Cmyka {
  const { c, m, y, k } = cmyk
  const avg = (c + m + y + k) / 4
  return { ...cmyk, c: avg, m: avg, y: avg, k: avg }
}

function avgNoBlackGrayscaleCmyk (cmyk: Cmyka): Cmyka {
  // this grayscale approach is probably not necessary
  const { c, m, y } = cmyk
  const avg = (c + m + y) / 3
  return { ...cmyk, c: avg, m: avg, y: avg, k: avg }
}

function minChannelGrayscaleCmyk (cmyk: Cmyka): Cmyka {
  const { c, m, y, k } = cmyk
  const min = Math.min(c, m, y, k)
  return { ...cmyk, c: min, m: min, y: min, k: min }
}

function minNoBlackChannelGrayscaleCmyk (cmyk: Cmyka): Cmyka {
  const { c, m, y } = cmyk
  const min = Math.min(c, m, y)
  return { ...cmyk, c: min, m: min, y: min, k: min }
}

function maxChannelGrayscaleCmyk (cmyk: Cmyka): Cmyka {
  const { c, m, y, k } = cmyk
  const max = Math.max(c, m, y, k)
  return { ...cmyk, c: max, m: max, y: max, k: max }
}

function maxNoBlackChannelGrayscaleCmyk (cmyk: Cmyka): Cmyka {
  const { c, m, y } = cmyk
  const max = Math.max(c, m, y)
  return { ...cmyk, c: max, m: max, y: max, k: max }
}

function grayscaleCmykVia (cmyk: Cmyka, channel: 'cyan' | 'magenta' | 'yellow' | 'black'): Cmyka {
  const { c, m, y, k } = cmyk
  switch (channel) {
    case 'cyan': return { ...cmyk, c, m: c, y: c, k: c }
    case 'magenta': return { ...cmyk, c: m, m, y: m, k: m }
    case 'yellow': return { ...cmyk, c: y, m: y, y, k: y }
    case 'black': return { ...cmyk, c: k, m: k, y: k, k: k }
  }
}

function perceptualGrayscaleCmyk (cmyk: Cmyka): Cmyka {
  return { ...cmyk, c: 0, m: 0, y: 0 }
}

// HSL & HSB
function grayscaleHsl (hsl: Hsla): Hsla { return { ...hsl, s: 0 } }
function grayscaleHsb (hsb: Hsba): Hsba { return { ...hsb, s: 0 } }

// XYZ
function grayscaleXyz (xyz: Xyza): Xyza { return { ...xyz, x: xyz.y, z: xyz.y } }

// LAB
function grayscaleLab (lab: Laba): Laba { return { ...lab, a: 0, b: 0 } }

// LCH
function grayscaleLch (lch: Lcha): Lcha { return { ...lch, c: 0 } }

type GrayscaleMethod = 'rgb-avg' | 'rgb-weighted-avg' | 'rgb-min-channel' | 'rgb-max-channel' | 'rgb-via-red' | 'rgb-via-green' | 'rgb-via-blue' | 'cmyk-avg' | 'cmyk-no-black-avg' | 'cmyk-min-channel' | 'cmyk-min-no-black-channel' | 'cmyk-max-channel' | 'cmyk-max-no-black-channel' | 'cmyk-via-cyan' | 'cmyk-via-magenta' | 'cmyk-via-yellow' | 'cmyk-via-black' | 'cmyk-perceptual' | 'hsl' | 'hsb' | 'xyz' | 'lab' | 'lch'

export function grayscale <C extends Color>(
  color: C,
  method: GrayscaleMethod = 'lab'
): TransformedColor<C> {
  switch (method) {
    case 'rgb-avg': return viaRgb(color, avgGrayscaleRgb)
    case 'rgb-weighted-avg': return viaRgb(color, weightedAvgGrayscaleRgb)
    case 'rgb-min-channel': return viaRgb(color, minChannelGrayscaleRgb)
    case 'rgb-max-channel': return viaRgb(color, maxChannelGrayscaleRgb)
    case 'rgb-via-red': return viaRgb(color, rgb => grayscaleRgbVia(rgb, 'red'))
    case 'rgb-via-green': return viaRgb(color, rgb => grayscaleRgbVia(rgb, 'green'))
    case 'rgb-via-blue': return viaRgb(color, rgb => grayscaleRgbVia(rgb, 'blue'))
    
    case 'cmyk-avg': return viaCmyk(color, avgGrayscaleCmyk)
    case 'cmyk-no-black-avg': return viaCmyk(color, avgNoBlackGrayscaleCmyk)
    case 'cmyk-min-channel': return viaCmyk(color, minChannelGrayscaleCmyk)
    case 'cmyk-min-no-black-channel': return viaCmyk(color, minNoBlackChannelGrayscaleCmyk)
    case 'cmyk-max-channel': return viaCmyk(color, maxChannelGrayscaleCmyk)
    case 'cmyk-max-no-black-channel': return viaCmyk(color, maxNoBlackChannelGrayscaleCmyk)
    case 'cmyk-via-cyan': return viaCmyk(color, cmyk => grayscaleCmykVia(cmyk, 'cyan'))
    case 'cmyk-via-magenta': return viaCmyk(color, cmyk => grayscaleCmykVia(cmyk, 'magenta'))
    case 'cmyk-via-yellow': return viaCmyk(color, cmyk => grayscaleCmykVia(cmyk, 'yellow'))
    case 'cmyk-via-black': return viaCmyk(color, cmyk => grayscaleCmykVia(cmyk, 'black'))
    case 'cmyk-perceptual': return viaCmyk(color, perceptualGrayscaleCmyk)

    case 'hsl': return viaHsl(color, grayscaleHsl)
    case 'hsb': return viaHsb(color, grayscaleHsb)
    case 'xyz': return viaXyz(color, grayscaleXyz)
    case 'lab': return viaLab(color, grayscaleLab)
    case 'lch': return viaLch(color, grayscaleLch)
  }
}

/* * * * * * * * * * * * * * * * * *
 * sRGB linearization / delinearization
 * * * * * * * * * * * * * * * * * */

type Srgba = {
  linearR: number // 0-1
  linearG: number // 0-1
  linearB: number // 0-1
  a?: number // 0-1
}

export function linearizeToSRgb (rgb: Rgba): Srgba {
  const cleanRgb = tidy(rgb)
  const linearChannel = (v: number) => {
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

export function delinearizeToRgb (srgb: Srgba): Rgba {
  const gammaChannel = (v: number) => {
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

/* * * * * * * * * * * * * * * * * *
 * Luminance
 * * * * * * * * * * * * * * * * * */

function luminanceRgb (rgb: Rgba): number {
  const { linearR, linearG, linearB } = linearizeToSRgb(rgb)
  return (0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB) / 255
}

type LuminanceMethod = 'rgb' | 'xyz' | 'lab'

export function luminance (color: Color, method: LuminanceMethod = 'lab'): number {
  switch (method) {
    case 'rgb': return luminanceRgb(toRgb(color))
    case 'xyz': return toXyz(color).y / 100
    case 'lab': return toLab(color).l / 100
  }
}

/* * * * * * * * * * * * * * * * * *
 * Distance
 * * * * * * * * * * * * * * * * * */

function distanceCiede2000 (c1: Laba, c2: Laba): number {
  const deg2rad = (deg: number) => (Math.PI / 180) * deg
  const rad2deg = (rad: number) => (180 / Math.PI) * rad

  // Step 1: Compute C* and mean C*
  const C1 = Math.sqrt(c1.a * c1.a + c1.b * c1.b)
  const C2 = Math.sqrt(c2.a * c2.a + c2.b * c2.b)
  const meanC = (C1 + C2) / 2

  // Step 2: Compute G
  const meanC7 = Math.pow(meanC, 7)
  const G = 0.5 * (1 - Math.sqrt(meanC7 / (meanC7 + Math.pow(25, 7))))

  // Step 3: a' values
  const a1p = (1 + G) * c1.a
  const a2p = (1 + G) * c2.a

  // Step 4: C' and h'
  const C1p = Math.sqrt(a1p * a1p + c1.b * c1.b)
  const C2p = Math.sqrt(a2p * a2p + c2.b * c2.b)
  const h1p = Math.atan2(c1.b, a1p)
  const h2p = Math.atan2(c2.b, a2p)

  // Step 5: ΔL', ΔC', ΔH'
  const dLp = c2.l - c1.l
  const dCp = C2p - C1p
  let dhp = h2p - h1p
  if (dhp > Math.PI) dhp -= 2 * Math.PI
  if (dhp < -Math.PI) dhp += 2 * Math.PI
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2)

  // Step 6: mean L', mean C', mean h'
  const meanLp = (c1.l + c2.l) / 2
  let meanHp = (h1p + h2p) / 2
  if (Math.abs(h1p - h2p) > Math.PI) { meanHp += Math.PI }

  // Step 7: T
  const T = 1
    - 0.17 * Math.cos(meanHp - deg2rad(30))
    + 0.24 * Math.cos(2 * meanHp)
    + 0.32 * Math.cos(3 * meanHp + deg2rad(6))
    - 0.20 * Math.cos(4 * meanHp - deg2rad(63))

  // Step 8: SL, SC, SH
  const SL = 1 + (0.015 * (meanLp - 50) * (meanLp - 50)) / Math.sqrt(20 + (meanLp - 50) * (meanLp - 50))
  const SC = 1 + 0.045 * meanC
  const SH = 1 + 0.015 * meanC * T

  // Step 9: RT
  const deltaTheta = deg2rad(60) * Math.exp(-((rad2deg(meanHp) - 275) / 25) * ((rad2deg(meanHp) - 275) / 25))
  const RC = Math.sqrt(Math.pow(meanC, 7) / (Math.pow(meanC, 7) + Math.pow(25, 7)))
  const RT = -2 * RC * Math.sin(deltaTheta)

  // Step 10: return ΔE00
  return Math.sqrt(
    (dLp / SL) * (dLp / SL) +
      (dCp / SC) * (dCp / SC) +
      (dHp / SH) * (dHp / SH) +
      RT * (dCp / SC) * (dHp / SH)
  )
}

// [WIP] maybe other implementations too (cie76, cie94, cmc, euclidean), but the output range can be different, so maybe should we normalize the output to 0-100?

type DistanceMethod = 'ciede2000'

export function distance (c1: Color, c2: Color, method: DistanceMethod = 'ciede2000'): number {
  switch (method) {
    case 'ciede2000': return distanceCiede2000(toLab(c1), toLab(c2))
  }
}

/* * * * * * * * * * * * * * * * * *
 * Contrast
 * * * * * * * * * * * * * * * * * */

function contrastWcag (c1: Rgba, c2: Rgba): number {
  const L1 = luminanceRgb(c1)
  const L2 = luminanceRgb(c2)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  const numerator = lighter + 0.05
  const denominator = darker + 0.05
  const ratio = numerator / denominator
  return ratio
}

// [WIP] maybe contrast weber, michelson, rms, etc...

type ContrastMethod = 'wcag'

export function contrast (
  c1: Color,
  c2: Color,
  method: ContrastMethod = 'wcag'
): number {
  switch (method) {
    case 'wcag': return contrastWcag(toRgb(c1), toRgb(c2))
  }
}

/* * * * * * * * * * * * * * * * * *
 * Interpolation
 * * * * * * * * * * * * * * * * * */

function lerpRgb (rgb1: Rgba, rgb2: Rgba, amount: number): Rgba {
  const r = rgb1.r + (rgb2.r - rgb1.r) * amount
  const g = rgb1.g + (rgb2.g - rgb1.g) * amount
  const b = rgb1.b + (rgb2.b - rgb1.b) * amount
  const a = (rgb1.a ?? 1) + ((rgb2.a ?? 1) - (rgb1.a ?? 1)) * amount
  return { r, g, b, a }
}

function lerpLab (lab1: Laba, lab2: Laba, amount: number): Laba {
  const l = lab1.l + (lab2.l - lab1.l) * amount
  const a = lab1.a + (lab2.a - lab1.a) * amount
  const b = lab1.b + (lab2.b - lab1.b) * amount
  const al = (lab1.al ?? 1) + ((lab2.al ?? 1) - (lab1.al ?? 1)) * amount
  return { l, a, b, al }
}

function lerpLch (lch1: Lcha, lch2: Lcha, amount: number): Lcha {
  const l = lch1.l + (lch2.l - lch1.l) * amount
  const c = lch1.c + (lch2.c - lch1.c) * amount
  let hDiff = lch2.h - lch1.h
  if (hDiff > 180) hDiff -= 360
  if (hDiff < -180) hDiff += 360
  const h = (lch1.h + hDiff * amount + 360) % 360
  const a = (lch1.a ?? 1) + ((lch2.a ?? 1) - (lch1.a ?? 1)) * amount
  return { l, c, h, a }
}

function lerpHsl (hsl1: Hsla, hsl2: Hsla, amount: number): Hsla {
  const l = hsl1.l + (hsl2.l - hsl1.l) * amount
  const s = hsl1.s + (hsl2.s - hsl1.s) * amount
  let hDiff = hsl2.h - hsl1.h
  if (hDiff > 180) hDiff -= 360
  if (hDiff < -180) hDiff += 360
  const h = (hsl1.h + hDiff * amount + 360) % 360
  const a = (hsl1.a ?? 1) + ((hsl2.a ?? 1) - (hsl1.a ?? 1)) * amount
  return { h, s, l, a }
}

function lerpHsb (hsb1: Hsba, hsb2: Hsba, amount: number): Hsba {
  const b = hsb1.b + (hsb2.b - hsb1.b) * amount
  const s = hsb1.s + (hsb2.s - hsb1.s) * amount
  let hDiff = hsb2.h - hsb1.h
  if (hDiff > 180) hDiff -= 360
  if (hDiff < -180) hDiff += 360
  const h = (hsb1.h + hDiff * amount + 360) % 360
  const a = (hsb1.a ?? 1) + ((hsb2.a ?? 1) - (hsb1.a ?? 1)) * amount
  return { h, s, b, a }
}

function lerpLinearRgb (rgb1: Rgba, rgb2: Rgba, amount: number): Rgba {
  const linearChannel = (v: number) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  const delinearize = (v: number) => v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1/2.4) - 0.055
  const r = delinearize(linearChannel(rgb1.r) + (linearChannel(rgb2.r) - linearChannel(rgb1.r)) * amount)
  const g = delinearize(linearChannel(rgb1.g) + (linearChannel(rgb2.g) - linearChannel(rgb1.g)) * amount)
  const b = delinearize(linearChannel(rgb1.b) + (linearChannel(rgb2.b) - linearChannel(rgb1.b)) * amount)
  const a = (rgb1.a ?? 1) + ((rgb2.a ?? 1) - (rgb1.a ?? 1)) * amount
  return { r, g, b, a }
}

function lerpXyz (xyz1: Xyza, xyz2: Xyza, amount: number): Xyza {
  const x = xyz1.x + (xyz2.x - xyz1.x) * amount
  const y = xyz1.y + (xyz2.y - xyz1.y) * amount
  const z = xyz1.z + (xyz2.z - xyz1.z) * amount
  const a = (xyz1.a ?? 1) + ((xyz2.a ?? 1) - (xyz1.a ?? 1)) * amount
  return { x, y, z, a }
}

type LerpMethod = 'rgb' | 'lab' | 'lch' | 'hsl' | 'hsb' | 'rgb-linear' | 'xyz'

export function lerp <C1 extends Color, C2 extends Color>(
  c1: C1,
  c2: C2,
  amount: number,
  method: LerpMethod = 'rgb'
): TransformedColor<C1> {
  switch (method) {
    case 'rgb': return viaRgb(c1, rgb1 => lerpRgb(rgb1, toRgb(c2), amount))
    case 'lab': return viaLab(c1, lab1 => lerpLab(lab1, toLab(c2), amount))
    case 'lch': return viaLch(c1, lch1 => lerpLch(lch1, toLch(c2), amount))
    case 'hsl': return viaHsl(c1, hsl1 => lerpHsl(hsl1, toHsl(c2), amount))
    case 'hsb': return viaHsb(c1, hsb1 => lerpHsb(hsb1, toHsb(c2), amount))
    case 'rgb-linear': return viaRgb(c1, rgb1 => lerpLinearRgb(rgb1, toRgb(c2), amount))
    case 'xyz': return viaXyz(c1, xyz1 => lerpXyz(xyz1, toXyz(c2), amount))
  }
}

// [WIP] non linear interpolations ? Blend modes ?
