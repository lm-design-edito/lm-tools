import type { Sharp, SharpOptions } from 'sharp'
import type { Color } from '../../agnostic/colors/types.js'

/* * * * * * * * * * * * * * * 
 * GENERIC
 * * * * * * * * * * * * * * */

export type CreateOptions = {
  width?: number
  height?: number
  channels?: 3 | 4
  background?: Color
  noise?: {
    // type: 'gaussian' /* Sharp only supports gaussian for now so this is left out */
    mean?: number
    sigma?: number
  }
  pageHeight?: number
}

export type ImageLike = Sharp | Buffer | CreateOptions | string

/* * * * * * * * * * * * * * * 
 * CREATE
 * * * * * * * * * * * * * * */

/* * * * * * * * * * * * * * * 
 * FORMAT
 * * * * * * * * * * * * * * */

export type FormatCommonOptions = {
  width?: number
  height?: number
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  position?: number | string
  background?: Color
  kernel?: 'nearest' | 'cubic' | 'linear' | 'mitchell' | 'lanczos2' | 'lanczos3' | 'mks2013' | 'mks2021'
  withoutEnlargement?: boolean
  withoutReduction?: boolean
  fastShrinkOnLoad?: boolean
}

export type FormatJpgOptions = FormatCommonOptions & {
  type: 'jpg' | 'jpeg'
  quality?: number
  force?: boolean
  progressive?: boolean
  chromaSubsampling?: string
  trellisQuantisation?: boolean
  overshootDeringing?: boolean
  optimizeScans?: boolean
  optimizeCoding?: boolean
  quantizationTable?: number
  mozjpeg?: boolean
}

export type FormatPngOptions = FormatCommonOptions & {
  type: 'png'
  quality?: number
  force?: boolean
  progressive?: boolean
  compressionLevel?: number
  adaptiveFiltering?: boolean
  effort?: number
  palette?: boolean
  colors?: number
  dither?: number
}

export type FormatWebpOptions = FormatCommonOptions & {
  type: 'webp'
  quality?: number
  force?: boolean
  alphaQuality?: number
  lossless?: boolean
  nearLossless?: boolean
  smartSubsample?: boolean
  smartDeblock?: boolean
  effort?: number
  minSize?: boolean
  mixed?: boolean
  preset?: 'default' | 'picture' | 'photo' | 'drawing' | 'icon' | 'text'
  loop?: number
  delay?: number | number[]
}

export type FormatAvifOptions = FormatCommonOptions & {
  type: 'avif'
  quality?: number
  force?: boolean
  lossless?: boolean
  effort?: number
  chromaSubsampling?: string
  bitdepth?: 8 | 10 | 12
}

export type FormatTiffOptions = FormatCommonOptions & {
  type: 'tiff'
  quality?: number
  force?: boolean
  compression?: 'none' | 'jpeg' | 'deflate' | 'packbits' | 'ccittfax4' | 'lzw' | 'webp' | 'zstd' | 'jp2k'
  predictor?: 'none' | 'horizontal' | 'float'
  pyramid?: boolean
  tile?: boolean
  tileWidth?: number
  tileHeight?: number
  xres?: number
  yres?: number
  bitdepth?: 1 | 2 | 4 | 8
  miniswhite?: boolean
  resolutionUnit?: 'inch' | 'cm'
}

export type FormatHeifOptions = FormatCommonOptions & {
  type: 'heif'
  quality?: number
  force?: boolean
  compression?: 'av1' | 'hevc'
  lossless?: boolean
  effort?: number
  chromaSubsampling?: string
  bitdepth?: 8 | 10 | 12
}

export type FormatOptions = FormatJpgOptions | FormatPngOptions | FormatWebpOptions | FormatAvifOptions | FormatTiffOptions | FormatHeifOptions | FormatCommonOptions

/* * * * * * * * * * * * * * * 
 * TRANSFORM
 * * * * * * * * * * * * * * */

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
  sigma: number
}

export type BrightenOperationParams = {
  factor: number
}

export type ExtendOperationParams = {
  left?: number
  right?: number
  top?: number
  bottom?: number
  extendWith?: 'background' | 'copy' | 'repeat' | 'mirror'
  background?: Color
}

export type ExtractOperationParams = {
  left: number
  top: number
  width: number
  height: number
}

export type FlattenOperationParams = {
  background?: Color
}

export type HueOperationParams = {
  rotateDeg?: number
}

export type LevelOperationParams = {
  multiplier?: number
  offset?: number
}

export type LightenOperationParams = {
  amount?: number
}

export type NormalizeOperationParams = {
  lower?: number
  upper?: number
}

export type OverlayOperationParams = {
  input: Sharp
  top?: number
  left?: number
  tile?: boolean
  premultiplied?: boolean
  density?: number
  animated?: boolean
  autoOrient?: boolean
  ignoreIcc?: boolean
  pages?: number
  page?: number
  blend?: 'clear' | 'source' | 'over' | 'in' | 'out' | 'atop' | 'dest' | 'dest-over' | 'dest-in' | 'dest-out' | 'dest-atop' | 'xor' | 'add' | 'saturate' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'colour-dodge' | 'color-burn' | 'colour-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  gravity?: 'north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'east' | 'center' | 'centre'
}

export type ResizeOperationParams = {
  width?: number
  height?: number
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  position?: number | string
  background?: Color
  kernel?: 'nearest' | 'cubic' | 'linear' | 'mitchell' | 'lanczos2' | 'lanczos3' | 'mks2013' | 'mks2021'
  withoutEnlargement?: boolean
  withoutReduction?: boolean
  fastShrinkOnLoad?: boolean
}

export type RotateOperationParams = {
  angleDeg?: number
  background?: Color
}

export type SaturateOperationParams = {
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
  timeoutMs?: number
  opTimeoutMs?: number
  width?: number
  height?: number
}

export enum TransformErrCodes {
  PROCESS_TIMEOUT = 'process-timeout',
  OP_TIMEOUT = 'op-timeout',
  WIDTH_LIMIT_EXCEEDED = 'width-limit-exceeded',
  HEIGHT_LIMIT_EXCEEDED = 'height-limit-exceeded',
  UNKNOWN_ERROR = 'unknown-error'
}

export type TransformErr = {
  code: TransformErrCodes,
  details: string
}
