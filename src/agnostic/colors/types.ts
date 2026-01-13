/**
 * Represents a hexadecimal color string (e.g., "#FF5733").
 */
export type Hex = `#${string}`

/**
 * Represents a color in the RGBA color space.
 * @property {number} r - Red channel (0-255).
 * @property {number} g - Green channel (0-255).
 * @property {number} b - Blue channel (0-255).
 * @property {number} [a] - Alpha channel (0-1), optional.
 */
export type Rgba = {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
  a?: number // 0-1
}

/**
 * Represents a color in the HSLA color space.
 * @property {number} h - Hue (0-360).
 * @property {number} s - Saturation (0-100).
 * @property {number} l - Lightness (0-100).
 * @property {number} [a] - Alpha channel (0-1), optional.
 */
export type Hsla = {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
  a?: number // 0-1
}

/**
 * Represents a color in the HSBA (HSB/HSV) color space.
 * @property {number} h - Hue (0-360).
 * @property {number} s - Saturation (0-100).
 * @property {number} b - Brightness (0-100).
 * @property {number} [a] - Alpha channel (0-1), optional.
 */
export type Hsba = {
  h: number // 0-360
  s: number // 0-100
  b: number // 0-100
  a?: number // 0-1
}

/**
 * Represents a color in the CIELAB color space.
 * @property {number} l - Lightness (0-100).
 * @property {number} a - Green-red axis (approximately -128 to 127).
 * @property {number} b - Blue-yellow axis (approximately -128 to 127).
 * @property {number} [al] - Alpha channel (0-1), optional.
 */
export type Laba = {
  l: number // 0–100
  a: number // env. -128–127
  b: number // env. -128–127
  al?: number // 0-1
}

/**
 * Represents a color in the CIELCh color space.
 * @property {number} l - Lightness (0-100).
 * @property {number} c - Chroma (0 to approximately 150).
 * @property {number} h - Hue (0-360).
 * @property {number} [a] - Alpha channel (0-1), optional.
 */
export type Lcha = {
  l: number // 0–100
  c: number // 0–~150
  h: number // 0–360
  a?: number // 0-1
}

/**
 * Represents a color in the CMYK color space.
 * @property {number} c - Cyan (0-100).
 * @property {number} m - Magenta (0-100).
 * @property {number} y - Yellow (0-100).
 * @property {number} k - Black (0-100).
 * @property {number} [a] - Alpha channel (0-1), optional.
 */
export type Cmyka = {
  c: number // 0–100
  m: number // 0–100
  y: number // 0–100
  k: number // 0–100
  a?: number // 0-1
}

/**
 * Represents a color in the CIE XYZ color space.
 * @property {number} x - X tristimulus value (approximately 0-95.047).
 * @property {number} y - Y tristimulus value (approximately 0-100).
 * @property {number} z - Z tristimulus value (approximately 0-108.883).
 * @property {number} [a] - Alpha channel (0-1), optional.
 */
export type Xyza = {
  x: number // env. 0–95.047
  y: number // env. 0–100
  z: number // env. 0–108.883
  a?: number // 0-1
}

/**
 * Union type of all valid CSS named colors.
 */
export type CssColor = 'aliceblue' | 'antiquewhite' | 'aqua' | 'aquamarine' | 'azure' | 'beige' | 'bisque' | 'black' | 'blanchedalmond' | 'blue' | 'blueviolet' | 'brown' | 'burlywood' | 'cadetblue' | 'chartreuse' | 'chocolate' | 'coral' | 'cornflowerblue' | 'cornsilk' | 'crimson' | 'cyan' | 'darkblue' | 'darkcyan' | 'darkgoldenrod' | 'darkgray' | 'darkgreen' | 'darkgrey' | 'darkkhaki' | 'darkmagenta' | 'darkolivegreen' | 'darkorange' | 'darkorchid' | 'darkred' | 'darksalmon' | 'darkseagreen' | 'darkslateblue' | 'darkslategray' | 'darkslategrey' | 'darkturquoise' | 'darkviolet' | 'deeppink' | 'deepskyblue' | 'dimgray' | 'dimgrey' | 'dodgerblue' | 'firebrick' | 'floralwhite' | 'forestgreen' | 'fuchsia' | 'gainsboro' | 'ghostwhite' | 'gold' | 'goldenrod' | 'gray' | 'green' | 'greenyellow' | 'grey' | 'honeydew' | 'hotpink' | 'indianred' | 'indigo' | 'ivory' | 'khaki' | 'lavender' | 'lavenderblush' | 'lawngreen' | 'lemonchiffon' | 'lightblue' | 'lightcoral' | 'lightcyan' | 'lightgoldenrodyellow' | 'lightgray' | 'lightgreen' | 'lightgrey' | 'lightpink' | 'lightsalmon' | 'lightseagreen' | 'lightskyblue' | 'lightslategray' | 'lightslategrey' | 'lightsteelblue' | 'lightyellow' | 'lime' | 'limegreen' | 'linen' | 'magenta' | 'maroon' | 'mediumaquamarine' | 'mediumblue' | 'mediumorchid' | 'mediumpurple' | 'mediumseagreen' | 'mediumslateblue' | 'mediumspringgreen' | 'mediumturquoise' | 'mediumvioletred' | 'midnightblue' | 'mintcream' | 'mistyrose' | 'moccasin' | 'navajowhite' | 'navy' | 'oldlace' | 'olive' | 'olivedrab' | 'orange' | 'orangered' | 'orchid' | 'palegoldenrod' | 'palegreen' | 'paleturquoise' | 'palevioletred' | 'papayawhip' | 'peachpuff' | 'peru' | 'pink' | 'plum' | 'powderblue' | 'purple' | 'rebeccapurple' | 'red' | 'rosybrown' | 'royalblue' | 'saddlebrown' | 'salmon' | 'sandybrown' | 'seagreen' | 'seashell' | 'sienna' | 'silver' | 'skyblue' | 'slateblue' | 'slategray' | 'slategrey' | 'snow' | 'springgreen' | 'steelblue' | 'tan' | 'teal' | 'thistle' | 'tomato' | 'turquoise' | 'violet' | 'wheat' | 'white' | 'whitesmoke' | 'yellow' | 'yellowgreen'

type CssColorMap = { [K in CssColor]: Rgba }

/**
 * Map of CSS named colors to their corresponding RGBA values.
 */
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

/**
 * Union type representing any supported color format.
 */
export type Color = Hex | Rgba | Hsla | Hsba | Laba | Lcha | Cmyka | Xyza | CssColor

/**
 * Conditional type that maps a color type to its corresponding transformed type.
 * CSS colors are transformed to RGBA, while other formats remain unchanged.
 * @template C - The input color type.
 */
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

/**
 * Union type of all available color channel names across different color spaces.
 */
export type Channel = 'red' | 'green' | 'blue' | 'alpha' | 'hue' | 'saturation' | 'lightness' | 'brightness' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'x' | 'y' | 'z' | 'lightnessLab' | 'aLab' | 'bLab' | 'chroma' | 'hueLch'

/**
 * Available methods for inverting colors.
 */
export type InvertMethod = 'rgb' | 'lab' | 'lch'

/**
 * Available methods for rotating color hues.
 */
export type RotateMethod = 'hsl' | 'lab' | 'lch'

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

/**
 * Union type of all available color palette generation schemes.
 */
export type PaletteType = keyof PaletteMap<Color>
/**
 * Represents a generated color palette of a specific type.
 * @template C - The input color type.
 * @template T - The palette generation scheme.
 */
export type Palette<C extends Color, T extends PaletteType> = PaletteMap<C>[T]
/**
 * Available methods for converting colors to grayscale.
 */
export type GrayscaleMethod = 'rgb-avg' | 'rgb-weighted-avg' | 'rgb-min-channel' | 'rgb-max-channel' | 'rgb-via-red' | 'rgb-via-green' | 'rgb-via-blue' | 'cmyk-avg' | 'cmyk-no-black-avg' | 'cmyk-min-channel' | 'cmyk-min-no-black-channel' | 'cmyk-max-channel' | 'cmyk-max-no-black-channel' | 'cmyk-via-cyan' | 'cmyk-via-magenta' | 'cmyk-via-yellow' | 'cmyk-via-black' | 'cmyk-perceptual' | 'hsl' | 'hsb' | 'xyz' | 'lab' | 'lch'
/**
 * Represents a color in the linear sRGB color space.
 * @property {number} linearR - Linear red channel (0-1).
 * @property {number} linearG - Linear green channel (0-1).
 * @property {number} linearB - Linear blue channel (0-1).
 * @property {number} [a] - Alpha channel (0-1), optional.
 */
export type Srgba = {
  linearR: number // 0-1
  linearG: number // 0-1
  linearB: number // 0-1
  a?: number // 0-1
}
/**
 * Available methods for calculating color luminance.
 */
export type LuminanceMethod = 'rgb' | 'xyz' | 'lab'
/**
 * Available methods for calculating color distance.
 */
export type DistanceMethod = 'ciede2000'
/**
 * Available methods for calculating color contrast ratios.
 */
export type ContrastMethod = 'wcag'
/**
 * Available methods for interpolating (lerping) between colors.
 */
export type LerpMethod = 'rgb' | 'lab' | 'lch' | 'hsl' | 'hsb' | 'rgb-linear' | 'xyz'
