import { Color, TransformedColor, PaletteType, Palette } from '../types.js'
import { rotate } from '../rotate/index.js'

/* * * * * * * * * * * * * * * * * *
 * Complementary
 * * * * * * * * * * * * * * * * * */
function complementaryHsl <C extends Color>(color: C): TransformedColor<C> {
  return rotate(color, 180, 'hsl')
}

function complementaryLab <C extends Color>(color: C): TransformedColor<C> {
  return rotate(color, 180, 'lab')
}

function complementaryLch <C extends Color>(color: C): TransformedColor<C> {
  return rotate(color, 180, 'lch')
}

/* * * * * * * * * * * * * * * * * *
 * Split Complementary
 * * * * * * * * * * * * * * * * * */
function splitComplementaryHsl <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 150, 'hsl'),
    rotate(color, 210, 'hsl')
  ]
}

function splitComplementaryLab <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 150, 'lab'),
    rotate(color, 210, 'lab')
  ]
}

function splitComplementaryLch <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 150, 'lch'),
    rotate(color, 210, 'lch')
  ]
}

/* * * * * * * * * * * * * * * * * *
 * Triadic
 * * * * * * * * * * * * * * * * * */
function triadicHsl <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 120, 'hsl'),
    rotate(color, 240, 'hsl')
  ]
}

function triadicLab <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 120, 'lab'),
    rotate(color, 240, 'lab')
  ]
}

function triadicLch <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 120, 'lch'),
    rotate(color, 240, 'lch')
  ]
}

/* * * * * * * * * * * * * * * * * *
 * Tetradic
 * * * * * * * * * * * * * * * * * */
function tetradicHsl <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 90, 'hsl'),
    rotate(color, 180, 'hsl'),
    rotate(color, 270, 'hsl')
  ]
}

function tetradicLab <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 90, 'lab'),
    rotate(color, 180, 'lab'),
    rotate(color, 270, 'lab')
  ]
}

function tetradicLch <C extends Color>(color: C): readonly [TransformedColor<C>, TransformedColor<C>, TransformedColor<C>] {
  return [
    rotate(color, 90, 'lch'),
    rotate(color, 180, 'lch'),
    rotate(color, 270, 'lch')
  ]
}

export function palette<
  C extends Color,
  T extends PaletteType
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
