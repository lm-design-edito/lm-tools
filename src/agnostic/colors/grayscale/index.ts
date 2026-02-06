import type {
  Color,
  TransformedColor,
  GrayscaleMethod,
  Rgba,
  Cmyka,
  Hsla,
  Hsba,
  Xyza,
  Laba,
  Lcha
} from '../types.js'
import {
  viaRgb,
  viaCmyk,
  viaHsl,
  viaHsb,
  viaXyz,
  viaLab,
  viaLch
} from '../convert/index.js'

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
    case 'black': return { ...cmyk, c: k, m: k, y: k, k }
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

/**
 * Converts a color to grayscale using the specified method.
 *
 * @template C - The input color type.
 * @param {C} color - The color to convert to grayscale.
 * @param {GrayscaleMethod} [method='lab'] - The grayscale conversion method to use.
 * @returns {TransformedColor<C>} The grayscale color in the original format.
 */
export function grayscale <C extends Color> (
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
