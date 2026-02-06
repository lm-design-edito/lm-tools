import type { Sharp } from 'sharp'
import type { Color } from '../../agnostic/colors/types.js'

/* * * * * * * * * * * * * * *
 * GENERIC
 * * * * * * * * * * * * * * */

/** Union type representing any valid image input. */
export type ImageLike = Sharp | Buffer | CreateOptions | string

/* * * * * * * * * * * * * * *
 * CREATE
 * * * * * * * * * * * * * * */

export type CreateOptions = {
  /** Image width in pixels. */
  width?: number
  /** Image height in pixels. */
  height?: number
  /** Number of color channels (3 for RGB, 4 for RGBA). */
  channels?: 3 | 4
  /** Background color for the image. */
  background?: Color
  /** Gaussian noise configuration. */
  noise?: {
    // type: 'gaussian' /* Sharp only supports gaussian for now so this is left out */
    /** Mean value for noise generation. */
    mean?: number
    /** Standard deviation (sigma) for noise generation. */
    sigma?: number
  }
  /** Page height for multi-page images. */
  pageHeight?: number
}

/* * * * * * * * * * * * * * *
 * FORMAT
 * * * * * * * * * * * * * * */

export type FormatCommonOptions = {
  /** Target width in pixels. */
  width?: number
  /** Target height in pixels. */
  height?: number
  /** How the image should be resized to fit the dimensions. */
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  /** Position for the fit mode (gravity or coordinates). */
  position?: number | string
  /** Background color for areas not covered by the image. */
  background?: Color
  /** Interpolation kernel to use for resizing. */
  kernel?: 'nearest' | 'cubic' | 'linear' | 'mitchell' | 'lanczos2' | 'lanczos3' | 'mks2013' | 'mks2021'
  /** If `true`, do not enlarge the image if dimensions are smaller. */
  withoutEnlargement?: boolean
  /** If `true`, do not reduce the image if dimensions are larger. */
  withoutReduction?: boolean
  /** If `true`, use fast shrink-on-load for JPEG images. */
  fastShrinkOnLoad?: boolean
}

export type FormatJpgOptions = FormatCommonOptions & {
  /** Format type identifier. */
  type: 'jpg' | 'jpeg'
  /** Quality level (1-100). */
  quality?: number
  /** Force output format even if input is different. */
  force?: boolean
  /** Use progressive encoding. */
  progressive?: boolean
  /** Chroma subsampling format. */
  chromaSubsampling?: string
  /** Enable trellis quantisation. */
  trellisQuantisation?: boolean
  /** Enable overshoot deringing. */
  overshootDeringing?: boolean
  /** Optimize scans. */
  optimizeScans?: boolean
  /** Optimize coding. */
  optimizeCoding?: boolean
  /** Quantization table to use. */
  quantizationTable?: number
  /** Use mozjpeg encoder. */
  mozjpeg?: boolean
}

export type FormatPngOptions = FormatCommonOptions & {
  /** Format type identifier. */
  type: 'png'
  /** Quality level (1-100). */
  quality?: number
  /** Force output format even if input is different. */
  force?: boolean
  /** Use progressive encoding. */
  progressive?: boolean
  /** Compression level (0-9). */
  compressionLevel?: number
  /** Enable adaptive filtering. */
  adaptiveFiltering?: boolean
  /** Compression effort (1-10). */
  effort?: number
  /** Use palette mode. */
  palette?: boolean
  /** Number of colors in palette (1-256). */
  colors?: number
  /** Dither level (0-1). */
  dither?: number
}

export type FormatWebpOptions = FormatCommonOptions & {
  /** Format type identifier. */
  type: 'webp'
  /** Quality level (1-100). */
  quality?: number
  /** Force output format even if input is different. */
  force?: boolean
  /** Alpha channel quality (1-100). */
  alphaQuality?: number
  /** Use lossless encoding. */
  lossless?: boolean
  /** Use near-lossless encoding. */
  nearLossless?: boolean
  /** Enable smart subsample. */
  smartSubsample?: boolean
  /** Enable smart deblock. */
  smartDeblock?: boolean
  /** Compression effort (0-6). */
  effort?: number
  /** Optimize for minimum file size. */
  minSize?: boolean
  /** Use mixed encoding mode. */
  mixed?: boolean
  /** Preset for encoding. */
  preset?: 'default' | 'picture' | 'photo' | 'drawing' | 'icon' | 'text'
  /** Number of animation loops. */
  loop?: number
  /** Animation frame delays. */
  delay?: number | number[]
}

export type FormatAvifOptions = FormatCommonOptions & {
  /** Format type identifier. */
  type: 'avif'
  /** Quality level (1-100). */
  quality?: number
  /** Force output format even if input is different. */
  force?: boolean
  /** Use lossless encoding. */
  lossless?: boolean
  /** Compression effort (0-9). */
  effort?: number
  /** Chroma subsampling format. */
  chromaSubsampling?: string
  /** Bit depth (8, 10, or 12 bits). */
  bitdepth?: 8 | 10 | 12
}

export type FormatTiffOptions = FormatCommonOptions & {
  /** Format type identifier. */
  type: 'tiff'
  /** Quality level (1-100). */
  quality?: number
  /** Force output format even if input is different. */
  force?: boolean
  /** Compression method. */
  compression?: 'none' | 'jpeg' | 'deflate' | 'packbits' | 'ccittfax4' | 'lzw' | 'webp' | 'zstd' | 'jp2k'
  /** Predictor for compression. */
  predictor?: 'none' | 'horizontal' | 'float'
  /** Use pyramid structure. */
  pyramid?: boolean
  /** Use tiled structure. */
  tile?: boolean
  /** Tile width in pixels. */
  tileWidth?: number
  /** Tile height in pixels. */
  tileHeight?: number
  /** Horizontal resolution. */
  xres?: number
  /** Vertical resolution. */
  yres?: number
  /** Bit depth (1, 2, 4, or 8 bits). */
  bitdepth?: 1 | 2 | 4 | 8
  /** If `true`, minimum value is white. */
  miniswhite?: boolean
  /** Resolution unit. */
  resolutionUnit?: 'inch' | 'cm'
}

export type FormatHeifOptions = FormatCommonOptions & {
  /** Format type identifier. */
  type: 'heif'
  /** Quality level (1-100). */
  quality?: number
  /** Force output format even if input is different. */
  force?: boolean
  /** Compression codec. */
  compression?: 'av1' | 'hevc'
  /** Use lossless encoding. */
  lossless?: boolean
  /** Compression effort (0-9). */
  effort?: number
  /** Chroma subsampling format. */
  chromaSubsampling?: string
  /** Bit depth (8, 10, or 12 bits). */
  bitdepth?: 8 | 10 | 12
}

/** Union type representing all supported format options. */
export type FormatOptions = FormatJpgOptions | FormatPngOptions | FormatWebpOptions | FormatAvifOptions | FormatTiffOptions | FormatHeifOptions | FormatCommonOptions

/* * * * * * * * * * * * * * *
 * TRANSFORM
 * * * * * * * * * * * * * * */

/** Enumeration of available image transformation operation names. */
export enum OpName {
  BLUR = 'blur',
  BRIGHTEN = 'brighten',
  EXTEND = 'extend',
  EXTRACT = 'extract',
  FLATTEN = 'flatten',
  FLIP = 'flip',
  FLOP = 'flop',
  // [WIP] Frame ?
  HUE = 'hue',
  LEVEL = 'level',
  LIGHTEN = 'lighten',
  // Modulate will duplicate with hue, brighten, saturate and lighten
  NORMALIZE = 'normalize',
  OVERLAY = 'overlay',
  RESIZE = 'resize',
  ROTATE = 'rotate',
  SATURATE = 'saturate'
  // No need for scale, since resize can do the same thing
}

export type BlurOperationParams = {
  /** Blur sigma value (standard deviation). */
  sigma: number
}

export type BrightenOperationParams = {
  /** Brightness factor. */
  factor: number
}

export type ExtendOperationParams = {
  /** Pixels to extend on the left side. */
  left?: number
  /** Pixels to extend on the right side. */
  right?: number
  /** Pixels to extend on the top side. */
  top?: number
  /** Pixels to extend on the bottom side. */
  bottom?: number
  /** Method to use for extending. */
  extendWith?: 'background' | 'copy' | 'repeat' | 'mirror'
  /** Background color for extension. */
  background?: Color
}

export type ExtractOperationParams = {
  /** Left coordinate of the extraction region. */
  left: number
  /** Top coordinate of the extraction region. */
  top: number
  /** Width of the extraction region. */
  width: number
  /** Height of the extraction region. */
  height: number
}

export type FlattenOperationParams = {
  /** Background color for flattening. */
  background?: Color
}

export type HueOperationParams = {
  /** Hue rotation in degrees. */
  rotateDeg?: number
}

export type LevelOperationParams = {
  /** Multiplier for level adjustment. */
  multiplier?: number
  /** Offset for level adjustment. */
  offset?: number
}

export type LightenOperationParams = {
  /** Lightening amount. */
  amount?: number
}

export type NormalizeOperationParams = {
  /** Lower bound for normalization. */
  lower?: number
  /** Upper bound for normalization. */
  upper?: number
}

export type OverlayOperationParams = {
  /** Image to overlay. */
  input: ImageLike
  /** Top position for overlay. */
  top?: number
  /** Left position for overlay. */
  left?: number
  /** If `true`, tile the overlay image. */
  tile?: boolean
  /** If `true`, use premultiplied alpha. */
  premultiplied?: boolean
  /** Density for vector images. */
  density?: number
  /** If `true`, process animated images. */
  animated?: boolean
  /** If `true`, auto-orient the image. */
  autoOrient?: boolean
  /** If `true`, ignore ICC profile. */
  ignoreIcc?: boolean
  /** Number of pages to process. */
  pages?: number
  /** Specific page to process. */
  page?: number
  /** Blend mode for overlay. */
  blend?: 'clear' | 'source' | 'over' | 'in' | 'out' | 'atop' | 'dest' | 'dest-over' | 'dest-in' | 'dest-out' | 'dest-atop' | 'xor' | 'add' | 'saturate' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'colour-dodge' | 'color-burn' | 'colour-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  /** Gravity for positioning the overlay. */
  gravity?: 'north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'east' | 'center' | 'centre'
}

export type ResizeOperationParams = {
  /** Target width in pixels. */
  width?: number
  /** Target height in pixels. */
  height?: number
  /** How the image should be resized to fit the dimensions. */
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  /** Position for the fit mode (gravity or coordinates). */
  position?: number | string
  /** Background color for areas not covered by the image. */
  background?: Color
  /** Interpolation kernel to use for resizing. */
  kernel?: 'nearest' | 'cubic' | 'linear' | 'mitchell' | 'lanczos2' | 'lanczos3' | 'mks2013' | 'mks2021'
  /** If `true`, do not enlarge the image if dimensions are smaller. */
  withoutEnlargement?: boolean
  /** If `true`, do not reduce the image if dimensions are larger. */
  withoutReduction?: boolean
  /** If `true`, use fast shrink-on-load for JPEG images. */
  fastShrinkOnLoad?: boolean
}

export type RotateOperationParams = {
  /** Rotation angle in degrees. */
  angleDeg?: number
  /** Background color for areas revealed by rotation. */
  background?: Color
}

export type SaturateOperationParams = {
  /** Saturation level. */
  saturation?: number
}

export type BlurOperationDescriptor = { name: OpName.BLUR } & BlurOperationParams
export type BrightenOperationDescriptor = { name: OpName.BRIGHTEN } & BrightenOperationParams
export type ExtendOperationDescriptor = { name: OpName.EXTEND } & ExtendOperationParams
export type ExtractOperationDescriptor = { name: OpName.EXTRACT } & ExtractOperationParams
export type FlattenOperationDescriptor = { name: OpName.FLATTEN } & FlattenOperationParams
export type FlipOperationDescriptor = { name: OpName.FLIP }
export type FlopOperationDescriptor = { name: OpName.FLOP }
export type HueOperationDescriptor = { name: OpName.HUE } & HueOperationParams
export type LevelOperationDescriptor = { name: OpName.LEVEL } & LevelOperationParams
export type LightenOperationDescriptor = { name: OpName.LIGHTEN } & LightenOperationParams
export type NormalizeOperationDescriptor = { name: OpName.NORMALIZE } & NormalizeOperationParams
export type OverlayOperationDescriptor = { name: OpName.OVERLAY } & OverlayOperationParams
export type ResizeOperationDescriptor = { name: OpName.RESIZE } & ResizeOperationParams
export type RotateOperationDescriptor = { name: OpName.ROTATE } & RotateOperationParams
export type SaturateOperationDescriptor = { name: OpName.SATURATE } & SaturateOperationParams

export type OperationDescriptor = BlurOperationDescriptor
| BrightenOperationDescriptor
| ExtendOperationDescriptor
| ExtractOperationDescriptor
| FlattenOperationDescriptor
| FlipOperationDescriptor
| FlopOperationDescriptor
| HueOperationDescriptor
| LevelOperationDescriptor
| LightenOperationDescriptor
| NormalizeOperationDescriptor
| OverlayOperationDescriptor
| ResizeOperationDescriptor
| RotateOperationDescriptor
| SaturateOperationDescriptor

export type TransformLimits = {
  /** Maximum time allowed for the entire transformation process in milliseconds. */
  timeoutMs?: number
  /** Maximum time allowed for a single operation in milliseconds. */
  opTimeoutMs?: number
  /** Maximum allowed image width in pixels. */
  width?: number
  /** Maximum allowed image height in pixels. */
  height?: number
}

/** Error codes for transformation operations. */
export enum TransformErrCodes {
  PROCESS_TIMEOUT = 'process-timeout',
  OP_TIMEOUT = 'op-timeout',
  WIDTH_LIMIT_EXCEEDED = 'width-limit-exceeded',
  HEIGHT_LIMIT_EXCEEDED = 'height-limit-exceeded',
  UNKNOWN_ERROR = 'unknown-error'
}

export type TransformErr = {
  /** Error code indicating the type of error. */
  code: TransformErrCodes
  /** Human-readable error details. */
  details: string
}
