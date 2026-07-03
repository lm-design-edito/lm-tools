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

/** Options for creating a new blank image. */
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

/** Common resizing options shared across all output format types. */
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

/** Encoding options for JPEG output. */
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

/** Encoding options for PNG output. */
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

/** Encoding options for WebP output. */
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

/** Encoding options for AVIF output. */
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

/** Encoding options for TIFF output. */
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

/** Encoding options for HEIF/HEIC output. */
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

/** Parameters for the blur operation. */
export type BlurOperationParams = {
  /** Blur sigma value (standard deviation). */
  sigma: number
}

/** Parameters for the brighten operation. */
export type BrightenOperationParams = {
  /** Brightness factor. */
  factor: number
}

/** Parameters for the extend operation (add pixels around the image). */
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

/** Parameters for the extract operation (crop a region). */
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

/** Parameters for the flatten operation (merge alpha channel onto a background). */
export type FlattenOperationParams = {
  /** Background color for flattening. */
  background?: Color
}

/** Parameters for the hue rotation operation. */
export type HueOperationParams = {
  /** Hue rotation in degrees. */
  rotateDeg?: number
}

/** Parameters for the level adjustment operation. */
export type LevelOperationParams = {
  /** Multiplier for level adjustment. */
  multiplier?: number
  /** Offset for level adjustment. */
  offset?: number
}

/** Parameters for the lighten operation. */
export type LightenOperationParams = {
  /** Lightening amount. */
  amount?: number
}

/** Parameters for the normalize operation (stretch contrast to fill the output range). */
export type NormalizeOperationParams = {
  /** Lower bound for normalization. */
  lower?: number
  /** Upper bound for normalization. */
  upper?: number
}

/** Parameters for the overlay (composite) operation. */
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

/** Parameters for the resize operation. */
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

/** Parameters for the rotate operation. */
export type RotateOperationParams = {
  /** Rotation angle in degrees. */
  angleDeg?: number
  /** Background color for areas revealed by rotation. */
  background?: Color
}

/** Parameters for the saturation adjustment operation. */
export type SaturateOperationParams = {
  /** Saturation level. */
  saturation?: number
}

/** Discriminated union descriptor for the blur operation. */
export type BlurOperationDescriptor = { name: OpName.BLUR } & BlurOperationParams
/** Discriminated union descriptor for the brighten operation. */
export type BrightenOperationDescriptor = { name: OpName.BRIGHTEN } & BrightenOperationParams
/** Discriminated union descriptor for the extend operation. */
export type ExtendOperationDescriptor = { name: OpName.EXTEND } & ExtendOperationParams
/** Discriminated union descriptor for the extract operation. */
export type ExtractOperationDescriptor = { name: OpName.EXTRACT } & ExtractOperationParams
/** Discriminated union descriptor for the flatten operation. */
export type FlattenOperationDescriptor = { name: OpName.FLATTEN } & FlattenOperationParams
/** Discriminated union descriptor for the flip operation (vertical axis). */
export type FlipOperationDescriptor = { name: OpName.FLIP }
/** Discriminated union descriptor for the flop operation (horizontal axis). */
export type FlopOperationDescriptor = { name: OpName.FLOP }
/** Discriminated union descriptor for the hue rotation operation. */
export type HueOperationDescriptor = { name: OpName.HUE } & HueOperationParams
/** Discriminated union descriptor for the level adjustment operation. */
export type LevelOperationDescriptor = { name: OpName.LEVEL } & LevelOperationParams
/** Discriminated union descriptor for the lighten operation. */
export type LightenOperationDescriptor = { name: OpName.LIGHTEN } & LightenOperationParams
/** Discriminated union descriptor for the normalize operation. */
export type NormalizeOperationDescriptor = { name: OpName.NORMALIZE } & NormalizeOperationParams
/** Discriminated union descriptor for the overlay operation. */
export type OverlayOperationDescriptor = { name: OpName.OVERLAY } & OverlayOperationParams
/** Discriminated union descriptor for the resize operation. */
export type ResizeOperationDescriptor = { name: OpName.RESIZE } & ResizeOperationParams
/** Discriminated union descriptor for the rotate operation. */
export type RotateOperationDescriptor = { name: OpName.ROTATE } & RotateOperationParams
/** Discriminated union descriptor for the saturation adjustment operation. */
export type SaturateOperationDescriptor = { name: OpName.SATURATE } & SaturateOperationParams

/** Union of all supported image transformation operation descriptors. */
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

/** Safety limits applied during image transformation. */
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

/** Error descriptor returned when an image transformation fails. */
export type TransformErr = {
  /** Error code indicating the type of error. */
  code: TransformErrCodes
  /** Human-readable error details. */
  details: string
}
