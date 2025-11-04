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
export type CssColor = 'aliceblue'
  | 'antiquewhite'
  | 'aqua'
  | 'aquamarine'
  | 'azure'
  | 'beige'
  | 'bisque'
  | 'black'
  | 'blanchedalmond'
  | 'blue'
  | 'blueviolet'
  | 'brown'
  | 'burlywood'
  | 'cadetblue'
  | 'chartreuse'
  | 'chocolate'
  | 'coral'
  | 'cornflowerblue'
  | 'cornsilk'
  | 'crimson'
  | 'cyan'
  | 'darkblue'
  | 'darkcyan'
  | 'darkgoldenrod'
  | 'darkgray'
  | 'darkgreen'
  | 'darkgrey'
  | 'darkkhaki'
  | 'darkmagenta'
  | 'darkolivegreen'
  | 'darkorange'
  | 'darkorchid'
  | 'darkred'
  | 'darksalmon'
  | 'darkseagreen'
  | 'darkslateblue'
  | 'darkslategray'
  | 'darkslategrey'
  | 'darkturquoise'
  | 'darkviolet'
  | 'deeppink'
  | 'deepskyblue'
  | 'dimgray'
  | 'dimgrey'
  | 'dodgerblue'
  | 'firebrick'
  | 'floralwhite'
  | 'forestgreen'
  | 'fuchsia'
  | 'gainsboro'
  | 'ghostwhite'
  | 'gold'
  | 'goldenrod'
  | 'gray'
  | 'green'
  | 'greenyellow'
  | 'grey'
  | 'honeydew'
  | 'hotpink'
  | 'indianred'
  | 'indigo'
  | 'ivory'
  | 'khaki'
  | 'lavender'
  | 'lavenderblush'
  | 'lawngreen'
  | 'lemonchiffon'
  | 'lightblue'
  | 'lightcoral'
  | 'lightcyan'
  | 'lightgoldenrodyellow'
  | 'lightgray'
  | 'lightgreen'
  | 'lightgrey'
  | 'lightpink'
  | 'lightsalmon'
  | 'lightseagreen'
  | 'lightskyblue'
  | 'lightslategray'
  | 'lightslategrey'
  | 'lightsteelblue'
  | 'lightyellow'
  | 'lime'
  | 'limegreen'
  | 'linen'
  | 'magenta'
  | 'maroon'
  | 'mediumaquamarine'
  | 'mediumblue'
  | 'mediumorchid'
  | 'mediumpurple'
  | 'mediumseagreen'
  | 'mediumslateblue'
  | 'mediumspringgreen'
  | 'mediumturquoise'
  | 'mediumvioletred'
  | 'midnightblue'
  | 'mintcream'
  | 'mistyrose'
  | 'moccasin'
  | 'navajowhite'
  | 'navy'
  | 'oldlace'
  | 'olive'
  | 'olivedrab'
  | 'orange'
  | 'orangered'
  | 'orchid'
  | 'palegoldenrod'
  | 'palegreen'
  | 'paleturquoise'
  | 'palevioletred'
  | 'papayawhip'
  | 'peachpuff'
  | 'peru'
  | 'pink'
  | 'plum'
  | 'powderblue'
  | 'purple'
  | 'rebeccapurple'
  | 'red'
  | 'rosybrown'
  | 'royalblue'
  | 'saddlebrown'
  | 'salmon'
  | 'sandybrown'
  | 'seagreen'
  | 'seashell'
  | 'sienna'
  | 'silver'
  | 'skyblue'
  | 'slateblue'
  | 'slategray'
  | 'slategrey'
  | 'snow'
  | 'springgreen'
  | 'steelblue'
  | 'tan'
  | 'teal'
  | 'thistle'
  | 'tomato'
  | 'turquoise'
  | 'violet'
  | 'wheat'
  | 'white'
  | 'whitesmoke'
  | 'yellow'
  | 'yellowgreen'

type CssColorMap = {
  [K in CssColor]: Rgba
}

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

export function viaRgb (color: CssColor, transformer: (rgb: Rgba) => Rgba): Rgba
export function viaRgb (color: Hex, transformer: (rgb: Rgba) => Rgba): Hex
export function viaRgb (color: Rgba, transformer: (rgb: Rgba) => Rgba): Rgba
export function viaRgb (color: Hsla, transformer: (rgb: Rgba) => Rgba): Hsla
export function viaRgb (color: Hsba, transformer: (rgb: Rgba) => Rgba): Hsba
export function viaRgb (color: Cmyka, transformer: (rgb: Rgba) => Rgba): Cmyka
export function viaRgb (color: Xyza, transformer: (rgb: Rgba) => Rgba): Xyza
export function viaRgb (color: Laba, transformer: (rgb: Rgba) => Rgba): Laba
export function viaRgb (color: Lcha, transformer: (rgb: Rgba) => Rgba): Lcha
export function viaRgb (color: Color, transformer: (rgb: Rgba) => Rgba): TransformedColor<Color>
export function viaRgb (color: Color, transformer: (rgb: Rgba) => Rgba): TransformedColor<Color> {
  const rgb = toRgb(color)
  const transformedRgb = transformer(rgb)
  if (isRgb(color)) return transformedRgb
  if (isHsl(color)) return toHsl(transformedRgb)
  if (isHsb(color)) return toHsb(transformedRgb)
  if (isCmyk(color)) return toCmyk(transformedRgb)
  if (isXyz(color)) return toXyz(transformedRgb)
  if (isLab(color)) return toLab(transformedRgb)
  if (isLch(color)) return toLch(transformedRgb)
  if (isHex(color)) return toRgb(transformedRgb)
  if (isCssColor(color)) return transformedRgb
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

export function viaHsl (color: CssColor, transformer: (hsl: Hsla) => Hsla): Rgba
export function viaHsl (color: Hex, transformer: (hsl: Hsla) => Hsla): Hex
export function viaHsl (color: Rgba, transformer: (hsl: Hsla) => Hsla): Rgba
export function viaHsl (color: Hsla, transformer: (hsl: Hsla) => Hsla): Hsla
export function viaHsl (color: Hsba, transformer: (hsl: Hsla) => Hsla): Hsba
export function viaHsl (color: Cmyka, transformer: (hsl: Hsla) => Hsla): Cmyka
export function viaHsl (color: Xyza, transformer: (hsl: Hsla) => Hsla): Xyza
export function viaHsl (color: Laba, transformer: (hsl: Hsla) => Hsla): Laba
export function viaHsl (color: Lcha, transformer: (hsl: Hsla) => Hsla): Lcha
export function viaHsl (color: Color, transformer: (hsl: Hsla) => Hsla): TransformedColor<Color>
export function viaHsl (color: Color, transformer: (hsl: Hsla) => Hsla): TransformedColor<Color> {
  const hsl = toHsl(color)
  const transformedHsl = transformer(hsl)
  if (isHsl(color)) return transformedHsl
  if (isRgb(color)) return toRgb(transformedHsl)
  if (isHsb(color)) return toHsb(transformedHsl)
  if (isCmyk(color)) return toCmyk(transformedHsl)
  if (isXyz(color)) return toXyz(transformedHsl)
  if (isLab(color)) return toLab(transformedHsl)
  if (isLch(color)) return toLch(transformedHsl)
  if (isHex(color)) return toHex(transformedHsl)
  if (isCssColor(color)) return transformedHsl
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

export function viaHsb (color: CssColor, transformer: (hsb: Hsba) => Hsba): Rgba
export function viaHsb (color: Hex, transformer: (hsb: Hsba) => Hsba): Hex
export function viaHsb (color: Rgba, transformer: (hsb: Hsba) => Hsba): Rgba
export function viaHsb (color: Hsla, transformer: (hsb: Hsba) => Hsba): Hsla
export function viaHsb (color: Hsba, transformer: (hsb: Hsba) => Hsba): Hsba
export function viaHsb (color: Cmyka, transformer: (hsb: Hsba) => Hsba): Cmyka
export function viaHsb (color: Xyza, transformer: (hsb: Hsba) => Hsba): Xyza
export function viaHsb (color: Laba, transformer: (hsb: Hsba) => Hsba): Laba
export function viaHsb (color: Lcha, transformer: (hsb: Hsba) => Hsba): Lcha
export function viaHsb (color: Color, transformer: (hsb: Hsba) => Hsba): TransformedColor<Color>
export function viaHsb (color: Color, transformer: (hsb: Hsba) => Hsba): TransformedColor<Color> {
  const hsb = toHsb(color)
  const transformedHsb = transformer(hsb)
  if (isHsb(color)) return transformedHsb
  if (isRgb(color)) return toRgb(transformedHsb)
  if (isHsl(color)) return toHsl(transformedHsb)
  if (isCmyk(color)) return toCmyk(transformedHsb)
  if (isXyz(color)) return toXyz(transformedHsb)
  if (isLab(color)) return toLab(transformedHsb)
  if (isLch(color)) return toLch(transformedHsb)
  if (isHex(color)) return toHex(transformedHsb)
  if (isCssColor(color)) return transformedHsb
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

export function viaCmyk (color: CssColor, transformer: (cmyk: Cmyka) => Cmyka): Rgba
export function viaCmyk (color: Hex, transformer: (cmyk: Cmyka) => Cmyka): Hex
export function viaCmyk (color: Rgba, transformer: (cmyk: Cmyka) => Cmyka): Rgba
export function viaCmyk (color: Hsla, transformer: (cmyk: Cmyka) => Cmyka): Hsla
export function viaCmyk (color: Hsba, transformer: (cmyk: Cmyka) => Cmyka): Hsba
export function viaCmyk (color: Cmyka, transformer: (cmyk: Cmyka) => Cmyka): Cmyka
export function viaCmyk (color: Xyza, transformer: (cmyk: Cmyka) => Cmyka): Xyza
export function viaCmyk (color: Laba, transformer: (cmyk: Cmyka) => Cmyka): Laba
export function viaCmyk (color: Lcha, transformer: (cmyk: Cmyka) => Cmyka): Lcha
export function viaCmyk (color: Color, transformer: (cmyk: Cmyka) => Cmyka): TransformedColor<Color>
export function viaCmyk (color: Color, transformer: (cmyk: Cmyka) => Cmyka): TransformedColor<Color> {
  const cmyk = toCmyk(color)
  const transformedCmyk = transformer(cmyk)
  if (isHsb(color)) return transformedCmyk
  if (isRgb(color)) return toRgb(transformedCmyk)
  if (isHsl(color)) return toHsl(transformedCmyk)
  if (isCmyk(color)) return toCmyk(transformedCmyk)
  if (isXyz(color)) return toXyz(transformedCmyk)
  if (isLab(color)) return toLab(transformedCmyk)
  if (isLch(color)) return toLch(transformedCmyk)
  if (isHex(color)) return toHex(transformedCmyk)
  if (isCssColor(color)) return transformedCmyk
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

export function viaXyz (color: CssColor, transformer: (xyz: Xyza) => Xyza): Rgba
export function viaXyz (color: Hex, transformer: (xyz: Xyza) => Xyza): Hex
export function viaXyz (color: Rgba, transformer: (xyz: Xyza) => Xyza): Rgba
export function viaXyz (color: Hsla, transformer: (xyz: Xyza) => Xyza): Hsla
export function viaXyz (color: Hsba, transformer: (xyz: Xyza) => Xyza): Hsba
export function viaXyz (color: Cmyka, transformer: (xyz: Xyza) => Xyza): Cmyka
export function viaXyz (color: Xyza, transformer: (xyz: Xyza) => Xyza): Xyza
export function viaXyz (color: Laba, transformer: (xyz: Xyza) => Xyza): Laba
export function viaXyz (color: Lcha, transformer: (xyz: Xyza) => Xyza): Lcha
export function viaXyz (color: Color, transformer: (xyz: Xyza) => Xyza): TransformedColor<Color>
export function viaXyz (color: Color, transformer: (xyz: Xyza) => Xyza): TransformedColor<Color> {
  const xyz = toXyz(color)
  const transformedXyz = transformer(xyz)
  if (isHsb(color)) return transformedXyz
  if (isRgb(color)) return toRgb(transformedXyz)
  if (isHsl(color)) return toHsl(transformedXyz)
  if (isCmyk(color)) return toCmyk(transformedXyz)
  if (isXyz(color)) return toXyz(transformedXyz)
  if (isLab(color)) return toLab(transformedXyz)
  if (isLch(color)) return toLch(transformedXyz)
  if (isHex(color)) return toHex(transformedXyz)
  if (isCssColor(color)) return transformedXyz
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

export function viaLab (color: CssColor, transformer: (lab: Laba) => Laba): Rgba
export function viaLab (color: Hex, transformer: (lab: Laba) => Laba): Hex
export function viaLab (color: Rgba, transformer: (lab: Laba) => Laba): Rgba
export function viaLab (color: Hsla, transformer: (lab: Laba) => Laba): Hsla
export function viaLab (color: Hsba, transformer: (lab: Laba) => Laba): Hsba
export function viaLab (color: Cmyka, transformer: (lab: Laba) => Laba): Cmyka
export function viaLab (color: Xyza, transformer: (lab: Laba) => Laba): Xyza
export function viaLab (color: Laba, transformer: (lab: Laba) => Laba): Laba
export function viaLab (color: Lcha, transformer: (lab: Laba) => Laba): Lcha
export function viaLab (color: Color, transformer: (lab: Laba) => Laba): TransformedColor<Color>
export function viaLab (color: Color, transformer: (lab: Laba) => Laba): TransformedColor<Color> {
  const lab = toLab(color)
  const transformedLab = transformer(lab)
  if (isHsb(color)) return transformedLab
  if (isRgb(color)) return toRgb(transformedLab)
  if (isHsl(color)) return toHsl(transformedLab)
  if (isCmyk(color)) return toCmyk(transformedLab)
  if (isXyz(color)) return toXyz(transformedLab)
  if (isLab(color)) return toLab(transformedLab)
  if (isLch(color)) return toLch(transformedLab)
  if (isHex(color)) return toHex(transformedLab)
  if (isCssColor(color)) return transformedLab
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

export function viaLch (color: CssColor, transformer: (lch: Lcha) => Lcha): Rgba
export function viaLch (color: Hex, transformer: (lch: Lcha) => Lcha): Hex
export function viaLch (color: Rgba, transformer: (lch: Lcha) => Lcha): Rgba
export function viaLch (color: Hsla, transformer: (lch: Lcha) => Lcha): Hsla
export function viaLch (color: Hsba, transformer: (lch: Lcha) => Lcha): Hsba
export function viaLch (color: Cmyka, transformer: (lch: Lcha) => Lcha): Cmyka
export function viaLch (color: Xyza, transformer: (lch: Lcha) => Lcha): Xyza
export function viaLch (color: Laba, transformer: (lch: Lcha) => Lcha): Laba
export function viaLch (color: Lcha, transformer: (lch: Lcha) => Lcha): Lcha
export function viaLch (color: Color, transformer: (lch: Lcha) => Lcha): TransformedColor<Color>
export function viaLch (color: Color, transformer: (lch: Lcha) => Lcha): TransformedColor<Color> {
  const lch = toLch(color)
  const transformedLch = transformer(lch)
  if (isHsb(color)) return transformedLch
  if (isRgb(color)) return toRgb(transformedLch)
  if (isHsl(color)) return toHsl(transformedLch)
  if (isCmyk(color)) return toCmyk(transformedLch)
  if (isXyz(color)) return toXyz(transformedLch)
  if (isLab(color)) return toLab(transformedLch)
  if (isLch(color)) return toLch(transformedLch)
  if (isHex(color)) return toHex(transformedLch)
  if (isCssColor(color)) return transformedLch
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

/* * * * * * * * * * * * * * * * * *
 * Tidy
 * * * * * * * * * * * * * * * * * */
export function tidy (color: CssColor): Rgba
export function tidy (color: Hex): Hex
export function tidy (color: Rgba): Rgba
export function tidy (color: Hsla): Hsla
export function tidy (color: Hsba): Hsba
export function tidy (color: Cmyka): Cmyka
export function tidy (color: Xyza): Xyza
export function tidy (color: Laba): Laba
export function tidy (color: Lcha): Lcha
export function tidy (color: Color): TransformedColor<Color>
export function tidy (color: Color): TransformedColor<Color> {
  if (isRgb(color)) return {
    r: clamp(color.r, 0, 255),
    g: clamp(color.g, 0, 255),
    b: clamp(color.b, 0, 255),
    a: clamp(color.a ?? 1, 0, 1)
  }
  if (isHsl(color)) return {
    h: absoluteModulo(color.h, 360),
    s: clamp(color.s, 0, 100),
    l: clamp(color.l, 0, 100),
    a: clamp(color.a ?? 1, 0, 1)
  }
  if (isHsb(color)) return {
    h: absoluteModulo(color.h, 360),
    s: clamp(color.s, 0, 100),
    b: clamp(color.b, 0, 100),
    a: clamp(color.a ?? 1, 0, 1)
  }
  if (isCmyk(color)) return {
    c: clamp(color.c, 0, 100),
    m: clamp(color.m, 0, 100),
    y: clamp(color.y, 0, 100),
    k: clamp(color.k, 0, 100),
    a: clamp(color.a ?? 1, 0, 1)
  }
  if (isXyz(color)) return {
    x: color.x,
    y: color.y,
    z: color.z,
    a: clamp(color.a ?? 1, 0, 1)
  }
  if (isLab(color)) return {
    l: clamp(color.l, 0, 100),
    a: color.a,
    b: color.b,
    al: clamp(color.al ?? 1, 0, 1)
  }
  if (isLch(color)) return {
    l: clamp(color.l, 0, 100),
    c: Math.max(0, color.c),
    h: clamp(color.h, 0, 360),
    a: clamp(color.a ?? 1, 0, 1)
  }
  if (isCssColor(color)) return tidy(toRgb(color))
  if (isHex(color)) return toHex(tidy(toRgb(color)))
  const _typecheck: typeof color extends never ? true : false = true
  throw new Error(`Invalid color input: ${color}`)
}

/* * * * * * * * * * * * * * * * * *
 * Set channel
 * * * * * * * * * * * * * * * * * */

export type Channel = 'red'
  | 'green'
  | 'blue'
  | 'alpha'
  | 'hue'
  | 'saturation'
  | 'lightness'
  | 'brightness'
  | 'cyan'
  | 'magenta'
  | 'yellow'
  | 'black'
  | 'x'
  | 'y'
  | 'z'
  | 'lightnessLab'
  | 'aLab'
  | 'bLab'
  | 'chroma'
  | 'hueLch'

export function setChannel (color: CssColor, channel: Channel, value: number): Rgba
export function setChannel (color: Hex, channel: Channel, value: number): Hex
export function setChannel (color: Rgba, channel: Channel, value: number): Rgba
export function setChannel (color: Hsla, channel: Channel, value: number): Hsla
export function setChannel (color: Hsba, channel: Channel, value: number): Hsba
export function setChannel (color: Cmyka, channel: Channel, value: number): Cmyka
export function setChannel (color: Xyza, channel: Channel, value: number): Xyza
export function setChannel (color: Laba, channel: Channel, value: number): Laba
export function setChannel (color: Lcha, channel: Channel, value: number): Lcha
export function setChannel (color: Color, channel: Channel, value: number): TransformedColor<Color>
export function setChannel (color: Color, channel: Channel, value: number): TransformedColor<Color> {
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
export function getChannel (color: CssColor, channel: Channel): number
export function getChannel (color: Hex, channel: Channel): number
export function getChannel (color: Rgba, channel: Channel): number
export function getChannel (color: Hsla, channel: Channel): number
export function getChannel (color: Hsba, channel: Channel): number
export function getChannel (color: Cmyka, channel: Channel): number
export function getChannel (color: Xyza, channel: Channel): number
export function getChannel (color: Laba, channel: Channel): number
export function getChannel (color: Lcha, channel: Channel): number
export function getChannel (color: Color, channel: Channel): number
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
export function addChannel (color: CssColor, channel: Channel, amount: number): Rgba
export function addChannel (color: Hex, channel: Channel, amount: number): Hex
export function addChannel (color: Rgba, channel: Channel, amount: number): Rgba
export function addChannel (color: Hsla, channel: Channel, amount: number): Hsla
export function addChannel (color: Hsba, channel: Channel, amount: number): Hsba
export function addChannel (color: Cmyka, channel: Channel, amount: number): Cmyka
export function addChannel (color: Xyza, channel: Channel, amount: number): Xyza
export function addChannel (color: Laba, channel: Channel, amount: number): Laba
export function addChannel (color: Lcha, channel: Channel, amount: number): Lcha
export function addChannel (color: Color, channel: Channel, amount: number): TransformedColor<Color>
export function addChannel (color: Color, channel: Channel, amount: number): TransformedColor<Color> {
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
export function multChannel (color: CssColor, channel: Channel, factor: number): Rgba
export function multChannel (color: Hex, channel: Channel, factor: number): Hex
export function multChannel (color: Rgba, channel: Channel, factor: number): Rgba
export function multChannel (color: Hsla, channel: Channel, factor: number): Hsla
export function multChannel (color: Hsba, channel: Channel, factor: number): Hsba
export function multChannel (color: Cmyka, channel: Channel, factor: number): Cmyka
export function multChannel (color: Xyza, channel: Channel, factor: number): Xyza
export function multChannel (color: Laba, channel: Channel, factor: number): Laba
export function multChannel (color: Lcha, channel: Channel, factor: number): Lcha
export function multChannel (color: Color, channel: Channel, factor: number): TransformedColor<Color>
export function multChannel (color: Color, channel: Channel, factor: number): TransformedColor<Color> {
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
export function invert (color: CssColor): Rgba
export function invert (color: Hex): Hex
export function invert (color: Rgba): Rgba
export function invert (color: Hsla): Hsla
export function invert (color: Hsba): Hsba
export function invert (color: Cmyka): Cmyka
export function invert (color: Xyza): Xyza
export function invert (color: Laba): Laba
export function invert (color: Lcha): Lcha
export function invert (color: Color): TransformedColor<Color>
export function invert (color: Color): TransformedColor<Color> {
  return viaRgb(color, rgb => ({
    ...rgb,
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  }))
}

export function invertLab (color: CssColor): Rgba
export function invertLab (color: Hex): Hex
export function invertLab (color: Rgba): Rgba
export function invertLab (color: Hsla): Hsla
export function invertLab (color: Hsba): Hsba
export function invertLab (color: Cmyka): Cmyka
export function invertLab (color: Xyza): Xyza
export function invertLab (color: Laba): Laba
export function invertLab (color: Lcha): Lcha
export function invertLab (color: Color): TransformedColor<Color>
export function invertLab (color: Color): TransformedColor<Color> {
  return viaLab(color, lab => ({
    ...lab,
    l: 100 - lab.l,
    a: -1 * lab.a,
    b: -1 * lab.b
  }))
}

export function invertLch (color: CssColor): Rgba
export function invertLch (color: Hex): Hex
export function invertLch (color: Rgba): Rgba
export function invertLch (color: Hsla): Hsla
export function invertLch (color: Hsba): Hsba
export function invertLch (color: Cmyka): Cmyka
export function invertLch (color: Xyza): Xyza
export function invertLch (color: Laba): Laba
export function invertLch (color: Lcha): Lcha
export function invertLch (color: Color): TransformedColor<Color>
export function invertLch (color: Color): TransformedColor<Color> {
  return viaLch(color, lch => ({
    ...lch,
    l: 100 - lch.l,
    h: absoluteModulo(lch.h + 180, 360)
  }))
}

/* * * * * * * * * * * * * * * * * *
 * Rotate
 * * * * * * * * * * * * * * * * * */
export function rotate (color: CssColor, degrees: number): Rgba
export function rotate (color: Hex, degrees: number): Hex
export function rotate (color: Rgba, degrees: number): Rgba
export function rotate (color: Hsla, degrees: number): Hsla
export function rotate (color: Hsba, degrees: number): Hsba
export function rotate (color: Cmyka, degrees: number): Cmyka
export function rotate (color: Xyza, degrees: number): Xyza
export function rotate (color: Laba, degrees: number): Laba
export function rotate (color: Lcha, degrees: number): Lcha
export function rotate (color: Color, degrees: number): TransformedColor<Color>
export function rotate (color: Color, degrees: number): TransformedColor<Color> {
  return addChannel(color, 'hue', degrees)
}

export function rotateLab (color: CssColor, degrees: number): Rgba
export function rotateLab (color: Hex, degrees: number): Hex
export function rotateLab (color: Rgba, degrees: number): Rgba
export function rotateLab (color: Hsla, degrees: number): Hsla
export function rotateLab (color: Hsba, degrees: number): Hsba
export function rotateLab (color: Cmyka, degrees: number): Cmyka
export function rotateLab (color: Xyza, degrees: number): Xyza
export function rotateLab (color: Laba, degrees: number): Laba
export function rotateLab (color: Lcha, degrees: number): Lcha
export function rotateLab (color: Color, degrees: number): TransformedColor<Color>
export function rotateLab (color: Color, degrees: number): TransformedColor<Color> {
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

export function rotateLch (color: CssColor, degrees: number): Rgba
export function rotateLch (color: Hex, degrees: number): Hex
export function rotateLch (color: Rgba, degrees: number): Rgba
export function rotateLch (color: Hsla, degrees: number): Hsla
export function rotateLch (color: Hsba, degrees: number): Hsba
export function rotateLch (color: Cmyka, degrees: number): Cmyka
export function rotateLch (color: Xyza, degrees: number): Xyza
export function rotateLch (color: Laba, degrees: number): Laba
export function rotateLch (color: Lcha, degrees: number): Lcha
export function rotateLch (color: Color, degrees: number): TransformedColor<Color>
export function rotateLch (color: Color, degrees: number): TransformedColor<Color> {
  return viaLch(color, lch => ({
    ...lch,
    h: absoluteModulo(lch.h + degrees, 360)
  }))
}

/* * * * * * * * * * * * * * * * * *
 * Rotations
 * * * * * * * * * * * * * * * * * */
export function rotations<A extends readonly number[]> (color: CssColor, angles: A): { [K in keyof A]: Rgba };
export function rotations<A extends readonly number[]> (color: Hex, angles: A): { [K in keyof A]: Hex };
export function rotations<A extends readonly number[]> (color: Rgba, angles: A): { [K in keyof A]: Rgba };
export function rotations<A extends readonly number[]> (color: Hsla, angles: A): { [K in keyof A]: Hsla };
export function rotations<A extends readonly number[]> (color: Hsba, angles: A): { [K in keyof A]: Hsba };
export function rotations<A extends readonly number[]> (color: Cmyka, angles: A): { [K in keyof A]: Cmyka };
export function rotations<A extends readonly number[]> (color: Xyza, angles: A): { [K in keyof A]: Xyza };
export function rotations<A extends readonly number[]> (color: Laba, angles: A): { [K in keyof A]: Laba };
export function rotations<A extends readonly number[]> (color: Lcha, angles: A): { [K in keyof A]: Lcha };
export function rotations<A extends readonly number[]> (color: Color, angles: A): { [K in keyof A]: TransformedColor<Color> };
export function rotations<A extends readonly number[]> (color: Color, angles: A): { [K in keyof A]: TransformedColor<Color> } {
  const result = angles.map(a => rotate(color, a)) as { [K in keyof A]: TransformedColor<Color> }
  return result
}

export function rotationsLab<A extends readonly number[]> (color: CssColor, angles: A): { [K in keyof A]: Rgba };
export function rotationsLab<A extends readonly number[]> (color: Hex, angles: A): { [K in keyof A]: Hex };
export function rotationsLab<A extends readonly number[]> (color: Rgba, angles: A): { [K in keyof A]: Rgba };
export function rotationsLab<A extends readonly number[]> (color: Hsla, angles: A): { [K in keyof A]: Hsla };
export function rotationsLab<A extends readonly number[]> (color: Hsba, angles: A): { [K in keyof A]: Hsba };
export function rotationsLab<A extends readonly number[]> (color: Cmyka, angles: A): { [K in keyof A]: Cmyka };
export function rotationsLab<A extends readonly number[]> (color: Xyza, angles: A): { [K in keyof A]: Xyza };
export function rotationsLab<A extends readonly number[]> (color: Laba, angles: A): { [K in keyof A]: Laba };
export function rotationsLab<A extends readonly number[]> (color: Lcha, angles: A): { [K in keyof A]: Lcha };
export function rotationsLab<A extends readonly number[]> (color: Color, angles: A): { [K in keyof A]: TransformedColor<Color> };
export function rotationsLab<A extends readonly number[]> (color: Color, angles: A): { [K in keyof A]: TransformedColor<Color> } {
  const result = angles.map(a => rotateLab(color, a)) as { [K in keyof A]: TransformedColor<Color> }
  return result
}

export function rotationsLch<A extends readonly number[]> (color: CssColor, angles: A): { [K in keyof A]: Rgba };
export function rotationsLch<A extends readonly number[]> (color: Hex, angles: A): { [K in keyof A]: Hex };
export function rotationsLch<A extends readonly number[]> (color: Rgba, angles: A): { [K in keyof A]: Rgba };
export function rotationsLch<A extends readonly number[]> (color: Hsla, angles: A): { [K in keyof A]: Hsla };
export function rotationsLch<A extends readonly number[]> (color: Hsba, angles: A): { [K in keyof A]: Hsba };
export function rotationsLch<A extends readonly number[]> (color: Cmyka, angles: A): { [K in keyof A]: Cmyka };
export function rotationsLch<A extends readonly number[]> (color: Xyza, angles: A): { [K in keyof A]: Xyza };
export function rotationsLch<A extends readonly number[]> (color: Laba, angles: A): { [K in keyof A]: Laba };
export function rotationsLch<A extends readonly number[]> (color: Lcha, angles: A): { [K in keyof A]: Lcha };
export function rotationsLch<A extends readonly number[]> (color: Color, angles: A): { [K in keyof A]: TransformedColor<Color> };
export function rotationsLch<A extends readonly number[]> (color: Color, angles: A): { [K in keyof A]: TransformedColor<Color> } {
  const result = angles.map(a => rotateLch(color, a)) as { [K in keyof A]: TransformedColor<Color> }
  return result
}

/* * * * * * * * * * * * * * * * * *
 * Complementary
 * * * * * * * * * * * * * * * * * */
function complementary (color: CssColor): Rgba
function complementary (color: Hex): Hex
function complementary (color: Rgba): Rgba
function complementary (color: Hsla): Hsla
function complementary (color: Hsba): Hsba
function complementary (color: Cmyka): Cmyka
function complementary (color: Xyza): Xyza
function complementary (color: Laba): Laba
function complementary (color: Lcha): Lcha
function complementary (color: Color): TransformedColor<Color>
function complementary (color: Color): TransformedColor<Color> {
  return rotate(color, 180)
}

function complementaryLab (color: CssColor): Rgba
function complementaryLab (color: Hex): Hex
function complementaryLab (color: Rgba): Rgba
function complementaryLab (color: Hsla): Hsla
function complementaryLab (color: Hsba): Hsba
function complementaryLab (color: Cmyka): Cmyka
function complementaryLab (color: Xyza): Xyza
function complementaryLab (color: Laba): Laba
function complementaryLab (color: Lcha): Lcha
function complementaryLab (color: Color): TransformedColor<Color>
function complementaryLab (color: Color): TransformedColor<Color> {
  return rotateLab(color, 180)
}

function complementaryLch (color: CssColor): Rgba
function complementaryLch (color: Hex): Hex
function complementaryLch (color: Rgba): Rgba
function complementaryLch (color: Hsla): Hsla
function complementaryLch (color: Hsba): Hsba
function complementaryLch (color: Cmyka): Cmyka
function complementaryLch (color: Xyza): Xyza
function complementaryLch (color: Laba): Laba
function complementaryLch (color: Lcha): Lcha
function complementaryLch (color: Color): TransformedColor<Color>
function complementaryLch (color: Color): TransformedColor<Color> {
  return rotateLch(color, 180)
}

/* * * * * * * * * * * * * * * * * *
 * Split Complementary
 * * * * * * * * * * * * * * * * * */
function splitComplementary (color: CssColor): readonly [Rgba, Rgba]
function splitComplementary (color: Hex): readonly [Hex, Hex]
function splitComplementary (color: Rgba): readonly [Rgba, Rgba]
function splitComplementary (color: Hsla): readonly [Hsla, Hsla]
function splitComplementary (color: Hsba): readonly [Hsba, Hsba]
function splitComplementary (color: Cmyka): readonly [Cmyka, Cmyka]
function splitComplementary (color: Xyza): readonly [Xyza, Xyza]
function splitComplementary (color: Laba): readonly [Laba, Laba]
function splitComplementary (color: Lcha): readonly [Lcha, Lcha]
function splitComplementary (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>]
function splitComplementary (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>] {
  return rotations(color, [150, 210] as const)
}

function splitComplementaryLab (color: CssColor): readonly [Rgba, Rgba]
function splitComplementaryLab (color: Hex): readonly [Hex, Hex]
function splitComplementaryLab (color: Rgba): readonly [Rgba, Rgba]
function splitComplementaryLab (color: Hsla): readonly [Hsla, Hsla]
function splitComplementaryLab (color: Hsba): readonly [Hsba, Hsba]
function splitComplementaryLab (color: Cmyka): readonly [Cmyka, Cmyka]
function splitComplementaryLab (color: Xyza): readonly [Xyza, Xyza]
function splitComplementaryLab (color: Laba): readonly [Laba, Laba]
function splitComplementaryLab (color: Lcha): readonly [Lcha, Lcha]
function splitComplementaryLab (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>]
function splitComplementaryLab (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>] {
  return rotationsLab(color, [150, 210] as const)
}

function splitComplementaryLch (color: CssColor): readonly [Rgba, Rgba]
function splitComplementaryLch (color: Hex): readonly [Hex, Hex]
function splitComplementaryLch (color: Rgba): readonly [Rgba, Rgba]
function splitComplementaryLch (color: Hsla): readonly [Hsla, Hsla]
function splitComplementaryLch (color: Hsba): readonly [Hsba, Hsba]
function splitComplementaryLch (color: Cmyka): readonly [Cmyka, Cmyka]
function splitComplementaryLch (color: Xyza): readonly [Xyza, Xyza]
function splitComplementaryLch (color: Laba): readonly [Laba, Laba]
function splitComplementaryLch (color: Lcha): readonly [Lcha, Lcha]
function splitComplementaryLch (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>]
function splitComplementaryLch (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>] {
  return rotationsLch(color, [150, 210] as const)
}

/* * * * * * * * * * * * * * * * * *
 * Triadic
 * * * * * * * * * * * * * * * * * */
function triadic (color: CssColor): readonly [Rgba, Rgba]
function triadic (color: Hex): readonly [Hex, Hex]
function triadic (color: Rgba): readonly [Rgba, Rgba]
function triadic (color: Hsla): readonly [Hsla, Hsla]
function triadic (color: Hsba): readonly [Hsba, Hsba]
function triadic (color: Cmyka): readonly [Cmyka, Cmyka]
function triadic (color: Xyza): readonly [Xyza, Xyza]
function triadic (color: Laba): readonly [Laba, Laba]
function triadic (color: Lcha): readonly [Lcha, Lcha]
function triadic (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>]
function triadic (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>] {
  return rotations(color, [120, 240] as const)
}

function triadicLab (color: CssColor): readonly [Rgba, Rgba]
function triadicLab (color: Hex): readonly [Hex, Hex]
function triadicLab (color: Rgba): readonly [Rgba, Rgba]
function triadicLab (color: Hsla): readonly [Hsla, Hsla]
function triadicLab (color: Hsba): readonly [Hsba, Hsba]
function triadicLab (color: Cmyka): readonly [Cmyka, Cmyka]
function triadicLab (color: Xyza): readonly [Xyza, Xyza]
function triadicLab (color: Laba): readonly [Laba, Laba]
function triadicLab (color: Lcha): readonly [Lcha, Lcha]
function triadicLab (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>]
function triadicLab (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>] {
  return rotationsLab(color, [120, 240] as const)
}

function triadicLch (color: CssColor): readonly [Rgba, Rgba]
function triadicLch (color: Hex): readonly [Hex, Hex]
function triadicLch (color: Rgba): readonly [Rgba, Rgba]
function triadicLch (color: Hsla): readonly [Hsla, Hsla]
function triadicLch (color: Hsba): readonly [Hsba, Hsba]
function triadicLch (color: Cmyka): readonly [Cmyka, Cmyka]
function triadicLch (color: Xyza): readonly [Xyza, Xyza]
function triadicLch (color: Laba): readonly [Laba, Laba]
function triadicLch (color: Lcha): readonly [Lcha, Lcha]
function triadicLch (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>]
function triadicLch (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>] {
  return rotationsLch(color, [120, 240] as const)
}

/* * * * * * * * * * * * * * * * * *
 * Tetradic
 * * * * * * * * * * * * * * * * * */
function tetradic (color: CssColor): readonly [Rgba, Rgba, Rgba]
function tetradic (color: Hex): readonly [Hex, Hex, Hex]
function tetradic (color: Rgba): readonly [Rgba, Rgba, Rgba]
function tetradic (color: Hsla): readonly [Hsla, Hsla, Hsla]
function tetradic (color: Hsba): readonly [Hsba, Hsba, Hsba]
function tetradic (color: Cmyka): readonly [Cmyka, Cmyka, Cmyka]
function tetradic (color: Xyza): readonly [Xyza, Xyza, Xyza]
function tetradic (color: Laba): readonly [Laba, Laba, Laba]
function tetradic (color: Lcha): readonly [Lcha, Lcha, Lcha]
function tetradic (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>, TransformedColor<Color>]
function tetradic (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>, TransformedColor<Color>] {
  return rotations(color, [90, 180, 270] as const)
}

function tetradicLab (color: CssColor): readonly [Rgba, Rgba, Rgba]
function tetradicLab (color: Hex): readonly [Hex, Hex, Hex]
function tetradicLab (color: Rgba): readonly [Rgba, Rgba, Rgba]
function tetradicLab (color: Hsla): readonly [Hsla, Hsla, Hsla]
function tetradicLab (color: Hsba): readonly [Hsba, Hsba, Hsba]
function tetradicLab (color: Cmyka): readonly [Cmyka, Cmyka, Cmyka]
function tetradicLab (color: Xyza): readonly [Xyza, Xyza, Xyza]
function tetradicLab (color: Laba): readonly [Laba, Laba, Laba]
function tetradicLab (color: Lcha): readonly [Lcha, Lcha, Lcha]
function tetradicLab (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>, TransformedColor<Color>]
function tetradicLab (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>, TransformedColor<Color>] {
  return rotationsLab(color, [90, 180, 270] as const)
}

function tetradicLch (color: CssColor): readonly [Rgba, Rgba, Rgba]
function tetradicLch (color: Hex): readonly [Hex, Hex, Hex]
function tetradicLch (color: Rgba): readonly [Rgba, Rgba, Rgba]
function tetradicLch (color: Hsla): readonly [Hsla, Hsla, Hsla]
function tetradicLch (color: Hsba): readonly [Hsba, Hsba, Hsba]
function tetradicLch (color: Cmyka): readonly [Cmyka, Cmyka, Cmyka]
function tetradicLch (color: Xyza): readonly [Xyza, Xyza, Xyza]
function tetradicLch (color: Laba): readonly [Laba, Laba, Laba]
function tetradicLch (color: Lcha): readonly [Lcha, Lcha, Lcha]
function tetradicLch (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>, TransformedColor<Color>]
function tetradicLch (color: Color): readonly [TransformedColor<Color>, TransformedColor<Color>, TransformedColor<Color>] {
  return rotationsLch(color, [90, 180, 270] as const)
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

export function palette<C extends Color, T extends keyof PaletteMap<C>>(color: C, type: T): Palette<C, T> {
  switch (type) {
    case 'complementary': return [complementary(color)] as const as Palette<C, T>
    case 'complementary-lab': return [complementaryLab(color)] as const as Palette<C, T>
    case 'complementary-lch': return [complementaryLch(color)] as const as Palette<C, T>
    case 'split-complementary': return splitComplementary(color) as Palette<C, T>
    case 'split-complementary-lab': return splitComplementaryLab(color)as Palette<C, T>
    case 'split-complementary-lch': return splitComplementaryLch(color)as Palette<C, T>
    case 'triadic': return triadic(color)as Palette<C, T>
    case 'triadic-lab': return triadicLab(color)as Palette<C, T>
    case 'triadic-lch': return triadicLch(color)as Palette<C, T>
    case 'tetradic': return tetradic(color)as Palette<C, T>
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

type GrayscaleMethod = 'rgb-avg'
  | 'rgb-weighted-avg'
  | 'rgb-min-channel'
  | 'rgb-max-channel'
  | 'rgb-via-red'
  | 'rgb-via-green'
  | 'rgb-via-blue'
  | 'cmyk-avg'
  | 'cmyk-no-black-avg'
  | 'cmyk-min-channel'
  | 'cmyk-min-no-black-channel'
  | 'cmyk-max-channel'
  | 'cmyk-max-no-black-channel'
  | 'cmyk-via-cyan'
  | 'cmyk-via-magenta'
  | 'cmyk-via-yellow'
  | 'cmyk-via-black'
  | 'cmyk-perceptual'
  | 'hsl'
  | 'hsb'
  | 'xyz'
  | 'lab'
  | 'lch'

export function grayscale (color: CssColor, method: GrayscaleMethod): Rgba
export function grayscale (color: Hex, method: GrayscaleMethod): Hex
export function grayscale (color: Rgba, method: GrayscaleMethod): Rgba
export function grayscale (color: Hsla, method: GrayscaleMethod): Hsla
export function grayscale (color: Hsba, method: GrayscaleMethod): Hsba
export function grayscale (color: Cmyka, method: GrayscaleMethod): Cmyka
export function grayscale (color: Xyza, method: GrayscaleMethod): Xyza
export function grayscale (color: Laba, method: GrayscaleMethod): Laba
export function grayscale (color: Lcha, method: GrayscaleMethod): Lcha
export function grayscale (color: Color, method: GrayscaleMethod): TransformedColor<Color>
export function grayscale (color: Color, method: GrayscaleMethod = 'lab'): TransformedColor<Color> {
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

export function luminance (color: CssColor, method: LuminanceMethod): number
export function luminance (color: Hex, method: LuminanceMethod): number
export function luminance (color: Rgba, method: LuminanceMethod): number
export function luminance (color: Hsla, method: LuminanceMethod): number
export function luminance (color: Hsba, method: LuminanceMethod): number
export function luminance (color: Cmyka, method: LuminanceMethod): number
export function luminance (color: Xyza, method: LuminanceMethod): number
export function luminance (color: Laba, method: LuminanceMethod): number
export function luminance (color: Lcha, method: LuminanceMethod): number
export function luminance (color: Color, method: LuminanceMethod): number
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

// Lab distance (ΔE00)
// Hard bounds: theoretically unbounded (ΔE00 can grow extremely if a/b/L are extreme)
// Soft bounds: 0 → ~100 for typical colors (white vs black ≈ 100)
export function distanceLab(c1: Laba, c2: Laba): number {
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

// LCh distance (lightness–chroma)
// Hard bounds: theoretically unbounded if L or C go outside typical ranges
// Soft bounds: 0 → ~180 (L 0–100, C 0–150 typical range gives √(100²+150²) ≈ 180)
export function distanceLch(c1: Lcha, c2: Lcha): number {
  const dL = c1.l - c2.l
  const dC = c1.c - c2.c
  return Math.sqrt(dL * dL + dC * dC)
}

// CAM16-UCS distance (approximation)
// Hard bounds: unbounded mathematically
// Soft bounds: 0 → ~173 (assuming J, a, b roughly 0–100 in normal perceptual colors)
export function distanceCam16(c1: Laba, c2: Laba): number {
  const cam1 = toCam16(c1)
  const cam2 = toCam16(c2)
  const dJ = cam1.J - cam2.J
  const da = cam1.a - cam2.a
  const db = cam1.b - cam2.b
  return Math.sqrt(dJ * dJ + da * da + db * db)
}

// HSV distance (lightness/value)
// Hard bounds: 0 → 100 (B channel physically constrained)
// Soft bounds: 0 → 100 (matches hard bounds)
export function distanceHsv(c1: Hsba, c2: Hsba): number {
  return Math.abs(c1.b - c2.b)
}

/* * * * * * * * * * * * * * * * * *
 * Contrast
 * * * * * * * * * * * * * * * * * */

// RGB (WCAG 2.x) using linearized sRGB
export function getContrastRgb (c1: Rgba, c2: Rgba): number {
  const L1 = luminanceRgb(c1)
  const L2 = luminanceRgb(c2)
  const bright = L1 > L2 ? L1 : L2
  const dark = L1 > L2 ? L2 : L1
  return (bright + 0.05) / (dark + 0.05)
}




//  * 
//  * 
//  * 
//  * 
//  * getLuminance(color)
//  * getContrast(color1, color2)
 
//  * distance(color1, color2)
//  * 
//  * mix(color1, color2, weight?)
//  * blend(color1, color2, mode)
//  * 
//  * fade(color, amount) => you suggested that this lowers the alpha, right ? what difference from setAlpha then?
//  * 
//  * * * * * * * * * * * * * * * * * */



// // export function getComp (color: [number, number, number]): [number, number, number] {
// //   const r = 255 - color[0];
// //   const g = 255 - color[1];
// //   const b = 255 - color[2];
// //   return [r, g, b];
// // }
