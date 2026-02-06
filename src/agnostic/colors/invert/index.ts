import { type Color, type TransformedColor, type InvertMethod } from '../types.js'
import { viaRgb, viaLab, viaLch } from '../convert/index.js'
import { absoluteModulo } from '../../numbers/absolute-modulo/index.js'

function invertRgb <C extends Color> (color: C): TransformedColor<C> {
  return viaRgb(color, rgb => ({
    ...rgb,
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  }))
}

function invertLab <C extends Color> (color: C): TransformedColor<C> {
  return viaLab(color, lab => ({
    ...lab,
    l: 100 - lab.l,
    a: -1 * lab.a,
    b: -1 * lab.b
  }))
}

function invertLch <C extends Color> (color: C): TransformedColor<C> {
  return viaLch(color, lch => ({
    ...lch,
    l: 100 - lch.l,
    h: absoluteModulo(lch.h + 180, 360)
  }))
}

/**
 * Inverts a color using the specified method.
 *
 * @template C - The input color type.
 * @param {C} color - The color to invert.
 * @param {InvertMethod} [method='lch'] - The inversion method to use.
 * @returns {TransformedColor<C>} The inverted color in the original format.
 */
export function invert <C extends Color> (color: C, method: InvertMethod = 'lch'): TransformedColor<C> {
  switch (method) {
    case 'rgb': return invertRgb(color)
    case 'lab': return invertLab(color)
    case 'lch': return invertLch(color)
  }
}
