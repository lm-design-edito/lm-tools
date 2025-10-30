import { isNonNullObject } from '../objects/is-object/index.js'
import { absoluteModulo } from '../numbers/absolute-modulo'
import { clamp } from 'agnostic/numbers/clamp'

export type Hex = string

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
  a?: number
}

export type Hsba = {
  h: number // 0-360
  s: number // 0-100
  b: number // 0-100
  a?: number
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

export type Color = Hex | Rgba | Hsla | Hsba | CssColor

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
  return /^[0-9a-fA-F]+$/.test(withoutHash)
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

export const isCssColor = (color: unknown): color is CssColor => typeof color === 'string'
  && (cssColors as any)[color] !== undefined

/* * * * * * * * * * * * * * * * * *
 * To RGB
 * * * * * * * * * * * * * * * * * */

// [WIP] maybe use absoluteModulo where needed?
export function hex2rgb (hex: Hex): Rgba {
  const inputHex = hex
  const startsWithHash = hex.startsWith('#')
  if (!startsWithHash) throw new Error(`invalid hex color ${inputHex}`)
  hex = hex.slice(1)
  if (hex.length === 3) { hex = hex.split('').map(c => c + c).join('') + 'ff' }
  else if (hex.length === 4) { hex = hex.split('').map(c => c + c).join('') }
  else if (hex.length === 6) { hex = hex + 'ff' }
  else if (hex.length === 8) { hex = hex }
  else throw new Error(`invalid hex color ${inputHex}`)
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const a = parseInt(hex.slice(6, 8), 16) / 255
  return { r, g, b, a }
}

export function hsl2rgb (hsl: Hsla): Rgba {
  const { h, s, l, a = 1 } = hsl
  const H = (((h % 360) + 360) % 360) / 360
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

export function hsb2rgb (hsb: Hsba): Rgba {
  const { h, s, b, a = 1 } = hsb
  const H = (((h % 360) + 360) % 360) / 360
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
  switch (i % 6) {
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

export function css2rgb (color: CssColor): Rgba
export function css2rgb (color: string): Rgba | undefined
export function css2rgb (color: string | CssColor): Rgba | undefined {
  if (color in cssColors) return cssColors[color as CssColor]
  return undefined
}

/* * * * * * * * * * * * * * * * * *
 * From RGB
 * * * * * * * * * * * * * * * * * */

export function rgb2hex (rgb: Rgba): Hex {
  const { r, g, b, a = 1 } = rgb
  const rHex = r.toString(16).padStart(2, '0')
  const gHex = g.toString(16).padStart(2, '0')
  const bHex = b.toString(16).padStart(2, '0')
  const aHex = Math.round(a * 255).toString(16).padStart(2, '0')
  return `#${rHex}${gHex}${bHex}${aHex}`
}

export function rgb2hsl (rgb: Rgba): Hsla {
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

export function rgb2hsb (rgb: Rgba): Hsba {
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

const cssColorsWithHex = Object.entries(cssColors).map(([cssColor, rgba]) => ({
  name: cssColor as CssColor,
  hex: rgb2hex(rgba),
  rgba
}))

export function rgb2css (rgb: Rgba): CssColor | undefined {
  const hexTarget = rgb2hex(rgb)
  return cssColorsWithHex.find(c => c.hex === hexTarget)?.name
}

/* * * * * * * * * * * * * * * * * *
 * Other conversions
 * * * * * * * * * * * * * * * * * */

// hex
export const hex2css = (hex: Hex) => rgb2css(hex2rgb(hex))
export const hex2hsb = (hex: Hex) => rgb2hsb(hex2rgb(hex))
export const hex2hsl = (hex: Hex) => rgb2hsl(hex2rgb(hex))

// css
export const css2hex = (css: CssColor) => rgb2hex(css2rgb(css))
export const css2hsb = (css: CssColor) => rgb2hsb(css2rgb(css))
export const css2hsl = (css: CssColor) => rgb2hsl(css2rgb(css))

// hsb
export const hsb2hex = (hsb: Hsba) => rgb2hex(hsb2rgb(hsb))
export const hsb2css = (hsb: Hsba) => rgb2css(hsb2rgb(hsb))
export const hsb2hsl = (hsb: Hsba) => rgb2hsl(hsb2rgb(hsb))

// hsl
export const hsl2hex = (hsl: Hsla) => rgb2hex(hsl2rgb(hsl))
export const hsl2css = (hsl: Hsla) => rgb2css(hsl2rgb(hsl))
export const hsl2hsb = (hsl: Hsla) => rgb2hsb(hsl2rgb(hsl))

export const toRgb = (color: Color): Rgba => {
  if (isRgb(color)) return color
  if (isHsl(color)) return hsl2rgb(color)
  if (isHsb(color)) return hsb2rgb(color)
  if (isHex(color)) return hex2rgb(color)
  if (isCssColor(color)) return css2rgb(color)
  throw new Error(`Invalid color input: ${color}`)
}

export const toHsl = (color: Color): Hsla => {
  if (isHsl(color)) return color
  if (isRgb(color)) return rgb2hsl(color)
  if (isHsb(color)) return hsb2hsl(color)
  if (isHex(color)) return hex2hsl(color)
  if (isCssColor(color)) return css2hsl(color)
  throw new Error(`Invalid color input: ${color}`)
}

export const toHsb = (color: Color): Hsba => {
  if (isHsb(color)) return color
  if (isRgb(color)) return rgb2hsb(color)
  if (isHsl(color)) return hsl2hsb(color)
  if (isHex(color)) return hex2hsb(color)
  if (isCssColor(color)) return css2hsb(color)
  throw new Error(`Invalid color input: ${color}`)
}

export const toCss = (color: Color): CssColor | undefined => {
  if (isCssColor(color)) return color
  if (isRgb(color)) return rgb2css(color)
  if (isHsl(color)) return hsl2css(color)
  if (isHsb(color)) return hsb2css(color)
  if (isHex(color)) return hex2css(color)
  throw new Error(`Invalid color input: ${color}`)
}

export const toHex = (color: Color): Hex => {
  if (isHex(color)) return color
  if (isRgb(color)) return rgb2hex(color)
  if (isHsl(color)) return hsl2hex(color)
  if (isHsb(color)) return hsb2hex(color)
  if (isCssColor(color)) return css2hex(color)
  throw new Error(`Invalid color input: ${color}`)
}

/* * * * * * * * * * * * * * * * * *
 * Transformers
 * * * * * * * * * * * * * * * * * */

export function viaRgb (color: CssColor, transformer: (rgb: Rgba) => Rgba): Rgba
export function viaRgb (color: Hex, transformer: (rgb: Rgba) => Rgba): Hex
export function viaRgb (color: Rgba, transformer: (rgb: Rgba) => Rgba): Rgba
export function viaRgb (color: Hsla, transformer: (rgb: Rgba) => Rgba): Hsla
export function viaRgb (color: Hsba, transformer: (rgb: Rgba) => Rgba): Hsba
export function viaRgb (color: Color, transformer: (rgb: Rgba) => Rgba): Color
export function viaRgb (color: Color, transformer: (rgb: Rgba) => Rgba): Color {
  const rgb = toRgb(color)
  const transformedRgb = transformer(rgb)
  if (isRgb(color)) return transformedRgb
  if (isHsl(color)) return rgb2hsl(transformedRgb)
  if (isHsb(color)) return rgb2hsb(transformedRgb)
  if (isHex(color)) return rgb2hex(transformedRgb)
  if (isCssColor(color)) return transformedRgb
  throw new Error(`Invalid color input: ${color}`)
}

export function viaHsl (color: CssColor, transformer: (hsl: Hsla) => Hsla): Rgba
export function viaHsl (color: Hex, transformer: (hsl: Hsla) => Hsla): Hex
export function viaHsl (color: Rgba, transformer: (hsl: Hsla) => Hsla): Rgba
export function viaHsl (color: Hsla, transformer: (hsl: Hsla) => Hsla): Hsla
export function viaHsl (color: Hsba, transformer: (hsl: Hsla) => Hsla): Hsba
export function viaHsl (color: Color, transformer: (hsl: Hsla) => Hsla): Color
export function viaHsl (color: Color, transformer: (hsl: Hsla) => Hsla): Color {
  const hsl = toHsl(color)
  const transformedHsl = transformer(hsl)
  if (isHsl(color)) return transformedHsl
  if (isRgb(color)) return hsl2rgb(transformedHsl)
  if (isHsb(color)) return hsl2hsb(transformedHsl)
  if (isHex(color)) return hsl2hex(transformedHsl)
  if (isCssColor(color)) return transformedHsl
  throw new Error(`Invalid color input: ${color}`)
}

export function viaHsb (color: CssColor, transformer: (hsb: Hsba) => Hsba): Rgba
export function viaHsb (color: Hex, transformer: (hsb: Hsba) => Hsba): Hex
export function viaHsb (color: Rgba, transformer: (hsb: Hsba) => Hsba): Rgba
export function viaHsb (color: Hsla, transformer: (hsb: Hsba) => Hsba): Hsla
export function viaHsb (color: Hsba, transformer: (hsb: Hsba) => Hsba): Hsba
export function viaHsb (color: Color, transformer: (hsb: Hsba) => Hsba): Color
export function viaHsb (color: Color, transformer: (hsb: Hsba) => Hsba): Color {
  const hsb = toHsb(color)
  const transformedHsb = transformer(hsb)
  if (isHsb(color)) return transformedHsb
  if (isRgb(color)) return hsb2rgb(transformedHsb)
  if (isHsl(color)) return hsb2hsl(transformedHsb)
  if (isHex(color)) return hsb2hex(transformedHsb)
  if (isCssColor(color)) return transformedHsb
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
export function tidy (color: Color): Color
export function tidy (color: Color): Color {
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
  if (isCssColor(color)) return tidy(toRgb(color))
  if (isHex(color)) return toHex(tidy(toRgb(color)))
  throw new Error(`Invalid color input: ${color}`)
}

/* * * * * * * * * * * * * * * * * *
 * Complementary
 * * * * * * * * * * * * * * * * * */

// [WIP] THIS IS INVERSE, NOT COMPLEMENTARY
export function getComplementary (color: CssColor): Rgba
export function getComplementary (color: Hex): Hex
export function getComplementary (color: Rgba): Rgba
export function getComplementary (color: Hsla): Hsla
export function getComplementary (color: Hsba): Hsba
export function getComplementary (color: Color): Color
export function getComplementary (color: Color): Color {
  return viaRgb(color, (rgb: Rgba): Rgba => ({
    r: clamp(255 - rgb.r, 0, 255),
    g: clamp(255 - rgb.g, 0, 255),
    b: clamp(255 - rgb.b, 0, 255),
    a: clamp(rgb.a ?? 1, 0, 1)
  }))
}

/* * * * * * * * * * * * * * * * * *
 * Set channel
 * * * * * * * * * * * * * * * * * */

export type ColorChannel = 'red' | 'green' | 'blue' | 'alpha' | 'hue' | 'saturation' | 'lightness' | 'brightness'

export function setChannel (color: CssColor, channel: ColorChannel, value: number): Rgba
export function setChannel (color: Hex, channel: ColorChannel, value: number): Hex
export function setChannel (color: Rgba, channel: ColorChannel, value: number): Rgba
export function setChannel (color: Hsla, channel: ColorChannel, value: number): Hsla
export function setChannel (color: Hsba, channel: ColorChannel, value: number): Hsba
export function setChannel (color: Color, channel: ColorChannel, value: number): Color
export function setChannel (color: Color, channel: ColorChannel, value: number): Color {
  if (channel === 'red') return viaRgb(color, rgb => ({ ...rgb, r: clamp(value, 0, 255) }))
  if (channel === 'green') return viaRgb(color, rgb => ({ ...rgb, g: clamp(value, 0, 255) }))
  if (channel === 'blue') return viaRgb(color, rgb => ({ ...rgb, b: clamp(value, 0, 255) }))
  if (channel === 'hue') {
    if (isHsl(color)) return { ...color, h: absoluteModulo(value, 360) }
    if (isHsb(color)) return { ...color, h: absoluteModulo(value, 360) }
    return viaHsl(color, hsl => ({ ...hsl, h: absoluteModulo(value, 360) }))
  }
  if (channel === 'saturation') {
    if (isHsl(color)) return { ...color, s: clamp(value, 0, 100) }
    if (isHsb(color)) return { ...color, s: clamp(value, 0, 100) }
    return viaHsl(color, hsl => ({ ...hsl, s: clamp(value, 0, 100) }))
  }
  if (channel === 'lightness') return viaHsl(color, hsl => ({ ...hsl, l: clamp(value, 0, 100) }))
  if (channel == 'brightness') return viaHsb(color, hsb => ({ ...hsb, b: clamp(value, 0, 100) }))
  if (channel === 'alpha') {
    if (isRgb(color)) return { ...color, a: clamp(value, 0, 1) }
    if (isHsl(color)) return { ...color, a: clamp(value, 0, 1) }
    if (isHsb(color)) return { ...color, a: clamp(value, 0, 1) }
    return viaRgb(color, rgb => ({ ...rgb, a: clamp(value, 0, 1) }))
  }
  throw new Error(`Invalid color channel: ${channel}`)
}

/* * * * * * * * * * * * * * * * * *
 * Get channel
 * * * * * * * * * * * * * * * * * */

export function getChannel (color: CssColor, channel: ColorChannel): number
export function getChannel (color: Hex, channel: ColorChannel): number
export function getChannel (color: Rgba, channel: ColorChannel): number
export function getChannel (color: Hsla, channel: ColorChannel): number
export function getChannel (color: Hsba, channel: ColorChannel): number
export function getChannel (color: Color, channel: ColorChannel): number
export function getChannel (color: Color, channel: ColorChannel): number {
  if (channel === 'red') return toRgb(color).r
  if (channel === 'green') return toRgb(color).g
  if (channel === 'blue') return toRgb(color).b
  if (channel === 'hue') {
    if (isHsl(color)) return color.h
    if (isHsb(color)) return color.h
    return toHsl(color).h
  }
  if (channel === 'saturation') {
    if (isHsl(color)) return color.s
    if (isHsb(color)) return color.s
    return toHsl(color).s
  }
  if (channel === 'lightness') return toHsl(color).l
  if (channel == 'brightness') return toHsb(color).b
  if (channel === 'alpha') {
    if (isRgb(color)) return color.a ?? 1
    if (isHsl(color)) return color.a ?? 1
    if (isHsb(color)) return color.a ?? 1
    return toRgb(color).a ?? 1
  }
  throw new Error(`Invalid color channel: ${channel}`)
}

/* * * * * * * * * * * * * * * * * *
 * Get channel
 * * * * * * * * * * * * * * * * * */

export function addChannel (color: CssColor, channel: ColorChannel, amount: number): CssColor
export function addChannel (color: Hex, channel: ColorChannel, amount: number): Hex
export function addChannel (color: Rgba, channel: ColorChannel, amount: number): Rgba
export function addChannel (color: Hsla, channel: ColorChannel, amount: number): Hsla
export function addChannel (color: Hsba, channel: ColorChannel, amount: number): Hsba
export function addChannel (color: Color, channel: ColorChannel, amount: number): Color
export function addChannel (color: Color, channel: ColorChannel, amount: number): Color {
  if (channel === 'red') return viaRgb(color, rgb => ({ ...rgb, r: clamp(rgb.r + amount, 0, 255) }))
  if (channel === 'green') return viaRgb(color, rgb => ({ ...rgb, g: clamp(rgb.g + amount, 0, 255) }))
  if (channel === 'blue') return viaRgb(color, rgb => ({ ...rgb, b: clamp(rgb.b + amount, 0, 255) }))
  if (channel === 'hue') {
    if (isHsl(color)) return { ...color, h: absoluteModulo(color.h + amount, 360) }
    if (isHsb(color)) return { ...color, h: absoluteModulo(color.h + amount, 360) }
    return viaHsl(color, hsl => ({ ...hsl, h: absoluteModulo(hsl.h + amount, 360) }))
  }
  if (channel === 'saturation') {
    if (isHsl(color)) return { ...color, s: clamp(color.s + amount, 0, 100) }
    if (isHsb(color)) return { ...color, s: clamp(color.s + amount, 0, 100) }
    return viaHsl(color, hsl => ({ ...hsl, s: clamp(hsl.s + amount, 0, 100) }))
  }
  if (channel === 'lightness') return viaHsl(color, hsl => ({ ...hsl, l: clamp(hsl.l + amount, 0, 100) }))
  if (channel == 'brightness') return viaHsb(color, hsb => ({ ...hsb, b: clamp(hsb.b + amount, 0, 100) }))
  if (channel === 'alpha') {
    if (isRgb(color)) return { ...color, a: clamp((color.a ?? 1) + amount, 0, 1) }
    if (isHsl(color)) return { ...color, a: clamp(color.a ?? 1 + amount, 0, 1) }
    if (isHsb(color)) return { ...color, a: clamp(color.a ?? 1 + amount, 0, 1) }
    return viaRgb(color, rgb => ({ ...rgb, a: clamp(rgb.a ?? 1 + amount, 0, 1) }))
  }
  throw new Error(`Invalid color channel: ${channel}`)
}

/* * * * * * * * * * * * * * * * * *
 * Mult channel
 * * * * * * * * * * * * * * * * * */

export function multChannel (color: CssColor, channel: ColorChannel, factor: number): CssColor
export function multChannel (color: Hex, channel: ColorChannel, factor: number): Hex
export function multChannel (color: Rgba, channel: ColorChannel, factor: number): Rgba
export function multChannel (color: Hsla, channel: ColorChannel, factor: number): Hsla
export function multChannel (color: Hsba, channel: ColorChannel, factor: number): Hsba
export function multChannel (color: Color, channel: ColorChannel, factor: number): Color
export function multChannel (color: Color, channel: ColorChannel, factor: number): Color {
  if (channel === 'red') return viaRgb(color, rgb => ({ ...rgb, r: clamp(rgb.r * factor, 0, 255) }))
  if (channel === 'green') return viaRgb(color, rgb => ({ ...rgb, g: clamp(rgb.g * factor, 0, 255) }))
  if (channel === 'blue') return viaRgb(color, rgb => ({ ...rgb, b: clamp(rgb.b * factor, 0, 255) }))
  if (channel === 'hue') {
    if (isHsl(color)) return { ...color, h: absoluteModulo(color.h * factor, 360) }
    if (isHsb(color)) return { ...color, h: absoluteModulo(color.h * factor, 360) }
    return viaHsl(color, hsl => ({ ...hsl, h: absoluteModulo(hsl.h * factor, 360) }))
  }
  if (channel === 'saturation') {
    if (isHsl(color)) return { ...color, s: clamp(color.s * factor, 0, 100) }
    if (isHsb(color)) return { ...color, s: clamp(color.s * factor, 0, 100) }
    return viaHsl(color, hsl => ({ ...hsl, s: clamp(hsl.s * factor, 0, 100) }))
  }
  if (channel === 'lightness') return viaHsl(color, hsl => ({ ...hsl, l: clamp(hsl.l * factor, 0, 100) }))
  if (channel == 'brightness') return viaHsb(color, hsb => ({ ...hsb, b: clamp(hsb.b * factor, 0, 100) }))
  if (channel === 'alpha') {
    if (isRgb(color)) return { ...color, a: clamp((color.a ?? 1) * factor, 0, 1) }
    if (isHsl(color)) return { ...color, a: clamp(color.a ?? 1 * factor, 0, 1) }
    if (isHsb(color)) return { ...color, a: clamp(color.a ?? 1 * factor, 0, 1) }
    return viaRgb(color, rgb => ({ ...rgb, a: clamp(rgb.a ?? 1 * factor, 0, 1) }))
  }
  throw new Error(`Invalid color channel: ${channel}`)
}

// [WIP] the idea of multiplication does not really apply the same way
// to all channels :
// - red : mult by 2 should mean divide by 2 the gap between current and 255 ?
// - green : same
// - blue : same
// - hue : does it make any sense at all?
// 
// let's think of it later




//  * 
//  * 
//  * grayscale(color) 
//  * invert(color)
//  * 
//  * getTriadic(color)
//  * getTetradic(color)
//  * getAnalogous(color)
//  * getSplitComplementary(color)
//  * 
//  * getLuminance(color)
//  * getContrast(color1, color2)
 
//  * distance(color1, color2)
//  * 
//  * mix(color1, color2, weight?)
//  * blend(color1, color2, mode)
//  * 
//  * rotate(color, degrees)
//  * fade(color, amount) => you suggested that this lowers the alpha, right ? what difference from setAlpha then?
//  * 
//  * * * * * * * * * * * * * * * * * */



// // export function getComp (color: [number, number, number]): [number, number, number] {
// //   const r = 255 - color[0];
// //   const g = 255 - color[1];
// //   const b = 255 - color[2];
// //   return [r, g, b];
// // }
