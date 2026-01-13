import type {
  Color,
  Rgba,
  Laba,
  Lcha,
  Hsla,
  Hsba,
  Xyza,
  LerpMethod,
  TransformedColor
} from '../types.js'
import {
  viaRgb,
  viaLab,
  viaLch,
  viaHsl,
  viaHsb,
  viaXyz,
  toRgb,
  toLab,
  toLch,
  toHsl,
  toHsb,
  toXyz
} from '../convert/index.js'

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

/**
 * Linearly interpolates between two colors using the specified method.
 *
 * @template C1 - The first color type.
 * @template C2 - The second color type.
 * @param {C1} c1 - The starting color.
 * @param {C2} c2 - The ending color.
 * @param {number} amount - The interpolation amount (0-1), where 0 returns c1 and 1 returns c2.
 * @param {LerpMethod} [method='rgb'] - The interpolation method to use.
 * @returns {TransformedColor<C1>} The interpolated color in the format of c1.
 */
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
