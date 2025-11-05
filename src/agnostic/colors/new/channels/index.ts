import { clamp } from '../../../numbers/clamp/index.js'
import { absoluteModulo } from '../../../numbers/absolute-modulo/index.js'
import {
  Color,
  TransformedColor,
  Channel
} from '../types.js'
import {
  toRgb,
  toHsl,
  toHsb,
  toCmyk,
  toXyz,
  toLab,
  toLch,
  viaRgb,
  viaHsl,
  viaHsb,
  viaCmyk,
  viaXyz,
  viaLab,
  viaLch
} from '../convert/index.js'

/* * * * * * * * * * * * * * * * * *
 * Set channel
 * * * * * * * * * * * * * * * * * */

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
