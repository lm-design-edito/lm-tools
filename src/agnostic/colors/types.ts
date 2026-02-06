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
