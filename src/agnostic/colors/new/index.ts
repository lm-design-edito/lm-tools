import * as Types from './types.js'
import {
  setChannel,
  getChannel,
  addChannel,
  multChannel
} from './channels/index.js'
import { contrast } from './contrast/index.js'
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
} from './convert/index.js'
import { distance } from './distance/index.js'
import { grayscale } from './grayscale/index.js'
import { invert } from './invert/index.js'
import { lerp } from './lerp/index.js'
import { luminance } from './luminance/index.js'
import { palette } from './palette/index.js'
import { rotate } from './rotate/index.js'
import { tidy } from './tidy/index.js'
import {
  isHex,
  isRgb,
  isHsl,
  isHsb,
  isCmyk,
  isXyz,
  isLab,
  isLch,
  isCssColor
} from './typechecks/index.js'

export {
  Types,
  setChannel,
  getChannel,
  addChannel,
  multChannel,
  contrast,
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
  viaLch,
  distance,
  grayscale,
  invert,
  lerp,
  luminance,
  palette,
  rotate,
  tidy,
  isHex,
  isRgb,
  isHsl,
  isHsb,
  isCmyk,
  isXyz,
  isLab,
  isLch,
  isCssColor
}
