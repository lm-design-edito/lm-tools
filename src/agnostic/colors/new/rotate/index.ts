import { absoluteModulo } from '../../../numbers/absolute-modulo/index.js'
import { Color, TransformedColor, RotateMethod } from '../types.js'
import { addChannel } from '../channels/index.js'
import { viaLab, viaLch } from '../convert/index.js'

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
