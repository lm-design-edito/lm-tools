import { complementColor as complementColorFunc} from './complement-color/index.js'
import { HEXToRGB as HEXToRGBFunc } from './hex-to-rgb/index.js'
import { RGBToHEX as RGBToHEXFunc } from './rgb-to-hex/index.js'
import { RGBToHSL as RGBToHSLFunc } from './rgb-to-hsl/index.js'
import { HSLToRGB as HSLToRGBFunc } from './hsl-to-rgb/index.js'
import { lightenColor as lightenColorFunc } from './lighten-color/index.js'
import { saturateColor as saturateColorFunc } from './saturate-color/index.js'

export namespace Colors {
  export const complementColor = complementColorFunc
  export const HEXToRGB = HEXToRGBFunc
  export const RGBToHEX = RGBToHEXFunc
  export const RGBToHSL = RGBToHSLFunc
  export const HSLToRGB = HSLToRGBFunc
  export const lightenColor = lightenColorFunc
  export const saturateColor = saturateColorFunc
}
