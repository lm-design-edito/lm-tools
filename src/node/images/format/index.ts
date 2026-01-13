import sharp from 'sharp'
import zod from 'zod'
import { clamp } from '../../../agnostic/numbers/clamp/index.js'
import * as Outcome from '../../../agnostic/misc/outcome/index.js'
import { toSharpColor, toSharpInstance } from '../utils/index.js'
import type { Color } from '../../../agnostic/colors/types.js'
import { isColor } from '../../../agnostic/colors/typechecks/index.js'
import type {
  FormatCommonOptions,
  FormatJpgOptions,
  FormatPngOptions,
  FormatWebpOptions,
  FormatAvifOptions,
  FormatTiffOptions,
  FormatHeifOptions,
  FormatOptions,
  ImageLike
} from '../types.js'

/* * * * * * * * * * * * * * * 
 * SCHEMAS
 * * * * * * * * * * * * * * */

const formatCommonOptionsSchema = zod.object({
  width: zod.number().optional(),
  height: zod.number().optional(),
  fit: zod.enum(['contain', 'cover', 'fill', 'inside', 'outside']).optional(),
  position: zod.union([zod.number(), zod.string()]).optional(),
  background: zod.custom<Color>(isColor).optional(),
  kernel: zod.enum(['nearest', 'cubic', 'mitchell', 'lanczos2', 'lanczos3', 'mks2013', 'mks2021']).optional(),
  withoutEnlargement: zod.boolean().optional(),
  withoutReduction: zod.boolean().optional(),
  fastShrinkOnLoad: zod.boolean().optional()
})

const formatJpgOptionsSchema = formatCommonOptionsSchema.extend({
  type: zod.union([zod.literal('jpg'), zod.literal('jpeg')]),
  quality: zod.number().optional(),
  force: zod.boolean().optional(),
  progressive: zod.boolean().optional(),
  chromaSubsampling: zod.string().optional(),
  trellisQuantisation: zod.boolean().optional(),
  overshootDeringing: zod.boolean().optional(),
  optimizeScans: zod.boolean().optional(),
  optimizeCoding: zod.boolean().optional(),
  quantizationTable: zod.number().optional(),
  mozjpeg: zod.boolean().optional()
})

const formatPngOptionsSchema = formatCommonOptionsSchema.extend({
  type: zod.literal('png'),
  quality: zod.number().optional(),
  force: zod.boolean().optional(),
  progressive: zod.boolean().optional(),
  compressionLevel: zod.number().min(0).max(9).optional(),
  adaptiveFiltering: zod.boolean().optional(),
  effort: zod.number().min(1).max(10).optional(),
  palette: zod.boolean().optional(),
  colors: zod.number().min(1).max(256).optional(),
  dither: zod.number().min(0).max(1).optional()
})

const formatWebpOptionsSchema = formatCommonOptionsSchema.extend({
  type: zod.literal('webp'),
  quality: zod.number().optional(),
  force: zod.boolean().optional(),
  alphaQuality: zod.number().optional(),
  lossless: zod.boolean().optional(),
  nearLossless: zod.boolean().optional(),
  smartSubsample: zod.boolean().optional(),
  smartDeblock: zod.boolean().optional(),
  effort: zod.number().optional(),
  minSize: zod.boolean().optional(),
  mixed: zod.boolean().optional(),
  preset: zod.enum(['default', 'picture', 'photo', 'drawing', 'icon', 'text']).optional(),
  loop: zod.number().optional(),
  delay: zod.union([zod.number(), zod.array(zod.number())]).optional()
})

const formatAvifOptionsSchema = formatCommonOptionsSchema.extend({
  type: zod.literal('avif'),
  quality: zod.number().optional(),
  force: zod.boolean().optional(),
  lossless: zod.boolean().optional(),
  effort: zod.number().optional(),
  chromaSubsampling: zod.string().optional(),
  bitdepth: zod.union([zod.literal(8), zod.literal(10), zod.literal(12)]).optional()
})

const formatTiffOptionsSchema = formatCommonOptionsSchema.extend({
  type: zod.literal('tiff'),
  quality: zod.number().optional(),
  compression: zod.enum(['none', 'jpeg', 'deflate', 'packbits', 'ccittfax4', 'lzw', 'webp', 'zstd', 'jp2k']).optional(),
  force: zod.boolean().optional(),
  predictor: zod.enum(['none', 'horizontal', 'float']).optional(),
  pyramid: zod.boolean().optional(),
  tile: zod.boolean().optional(),
  tileWidth: zod.number().optional(),
  tileHeight: zod.number().optional(),
  xres: zod.number().optional(),
  yres: zod.number().optional(),
  bitdepth: zod.union([zod.literal(1), zod.literal(2), zod.literal(4), zod.literal(8)]).optional(),
  miniswhite: zod.boolean().optional(),
  resolutionUnit: zod.enum(['inch', 'cm']).optional()
})

const formatHeifOptionsSchema = formatCommonOptionsSchema.extend({
  type: zod.literal('heif'),
  quality: zod.number().optional(),
  force: zod.boolean().optional(),
  compression: zod.enum(['av1', 'hevc']).optional(),
  lossless: zod.boolean().optional(),
  effort: zod.number().optional(),
  chromaSubsampling: zod.string().optional(),
  bitdepth: zod.union([zod.literal(8), zod.literal(10), zod.literal(12)]).optional()
})

const formatKeepOptionsSchema = formatCommonOptionsSchema

const formatOptionsSchema = zod.union([
  formatJpgOptionsSchema,
  formatPngOptionsSchema,
  formatWebpOptionsSchema,
  formatAvifOptionsSchema,
  formatTiffOptionsSchema,
  formatHeifOptionsSchema,
  formatKeepOptionsSchema
])

/* * * * * * * * * * * * * * * 
 * TYPECHECKS
 * * * * * * * * * * * * * * */

/** Type guard to check if options match FormatCommonOptions. */
export const isFormatCommonOptions = (options: unknown): options is FormatCommonOptions => formatCommonOptionsSchema.safeParse(options).success
/** Type guard to check if options match FormatJpgOptions. */
export const isFormatJpgOptions = (options: unknown): options is FormatJpgOptions => formatJpgOptionsSchema.safeParse(options).success
/** Type guard to check if options match FormatPngOptions. */
export const isFormatPngOptions = (options: unknown): options is FormatPngOptions => formatPngOptionsSchema.safeParse(options).success
/** Type guard to check if options match FormatWebpOptions. */
export const isFormatWebpOptions = (options: unknown): options is FormatWebpOptions => formatWebpOptionsSchema.safeParse(options).success
/** Type guard to check if options match FormatAvifOptions. */
export const isFormatAvifOptions = (options: unknown): options is FormatAvifOptions => formatAvifOptionsSchema.safeParse(options).success
/** Type guard to check if options match FormatTiffOptions. */
export const isFormatTiffOptions = (options: unknown): options is FormatTiffOptions => formatTiffOptionsSchema.safeParse(options).success
/** Type guard to check if options match FormatHeifOptions. */
export const isFormatHeifOptions = (options: unknown): options is FormatHeifOptions => formatHeifOptionsSchema.safeParse(options).success
/** Type guard to check if options match FormatOptions. */
export const isFormatOptions = (options: unknown): options is FormatOptions => formatOptionsSchema.safeParse(options).success

/* * * * * * * * * * * * * * * 
 * CONVERTERS
 * * * * * * * * * * * * * * */
/** Converts FormatCommonOptions to Sharp resize options. */
export const toSharpResizeOptions = (options: FormatCommonOptions): sharp.ResizeOptions => {
  return {
    width: options.width,
    height: options.height,
    fit: options.fit,
    position: options.position,
    background: options.background
      ? toSharpColor(options.background)
      : undefined,
    kernel: options.kernel,
    withoutEnlargement: options.withoutEnlargement,
    withoutReduction: options.withoutReduction,
    fastShrinkOnLoad: options.fastShrinkOnLoad
  }
}

/** Converts FormatJpgOptions to Sharp JPEG options. */
export const toSharpJpegOptions = (options: FormatJpgOptions): sharp.JpegOptions => {
  return {
    quality: options.quality,
    force: options.force,
    progressive: options.progressive,
    chromaSubsampling: options.chromaSubsampling,
    trellisQuantisation: options.trellisQuantisation,
    overshootDeringing: options.overshootDeringing,
    optimizeScans: options.optimizeScans,
    optimizeCoding: options.optimizeCoding,
    quantizationTable: options.quantizationTable,
    mozjpeg: options.mozjpeg
  }
}

/** Converts FormatPngOptions to Sharp PNG options. */
export const toSharpPngOptions = (options: FormatPngOptions): sharp.PngOptions => {
  return {
    quality: options.quality,
    force: options.force,
    progressive: options.progressive,
    compressionLevel: options.compressionLevel,
    adaptiveFiltering: options.adaptiveFiltering,
    effort: options.effort,
    palette: options.palette,
    colors: options.colors,
    dither: options.dither
  }
}

/** Converts FormatWebpOptions to Sharp WebP options. */
export const toSharpWebpOptions = (options: FormatWebpOptions): sharp.WebpOptions => {
  return {
    quality: options.quality,
    loop: options.loop,
    delay: options.delay,
    force: options.force,
    alphaQuality: options.alphaQuality,
    lossless: options.lossless,
    nearLossless: options.nearLossless,
    smartSubsample: options.smartSubsample,
    smartDeblock: options.smartDeblock,
    effort: options.effort,
    minSize: options.minSize,
    mixed: options.mixed,
    preset: options.preset
  }
}

/** Converts FormatAvifOptions to Sharp AVIF options. */
export const toSharpAvifOptions = (options: FormatAvifOptions): sharp.AvifOptions => {
  return {
    force: options.force,
    quality: options.quality,
    lossless: options.lossless,
    effort: options.effort,
    chromaSubsampling: options.chromaSubsampling,
    bitdepth: options.bitdepth
  }
}

/** Converts FormatTiffOptions to Sharp TIFF options. */
export const toSharpTiffOptions = (options: FormatTiffOptions): sharp.TiffOptions => {
  return {
    force: options.force,
    quality: options.quality,
    compression: options.compression,
    predictor: options.predictor,
    pyramid: options.pyramid,
    tile: options.tile,
    tileWidth: options.tileWidth,
    tileHeight: options.tileHeight,
    xres: options.xres,
    yres: options.yres,
    bitdepth: options.bitdepth,
    miniswhite: options.miniswhite,
    resolutionUnit: options.resolutionUnit
  }
}

/** Converts FormatHeifOptions to Sharp HEIF options. */
export const toSharpHeifOptions = (options: FormatHeifOptions): sharp.HeifOptions => {
  return {
    force: options.force,
    quality: options.quality,
    compression: options.compression,
    lossless: options.lossless,
    effort: options.effort,
    chromaSubsampling: options.chromaSubsampling,
    bitdepth: options.bitdepth
  }
}

/* * * * * * * * * * * * * * * 
 * FUNCTIONS
 * * * * * * * * * * * * * * */

/**
 * Formats an image with the specified options.
 *
 * The function resizes and converts the image to the specified format (JPG, PNG, WebP,
 * AVIF, TIFF, HEIF, or keeps the original format) based on the provided options.
 *
 * @param input - The image to format. Can be a Sharp instance, Buffer, CreateOptions, or file path.
 * @param options - Format and resize options. See `FormatOptions` for details.
 * @returns
 * - On success:  `Outcome.makeSuccess(buffer)` containing the formatted image.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function format (input: ImageLike, options: FormatOptions): Promise<Outcome.Either<Buffer, string>> {
  const sharpInstance = await toSharpInstance(input)
  const resizeOptions = toSharpResizeOptions(options)
  const resizedInstance = sharpInstance.resize(resizeOptions)
  if (isFormatJpgOptions(options)) return Outcome.makeSuccess(await resizedInstance.jpeg(toSharpJpegOptions(options)).toBuffer())
  if (isFormatPngOptions(options)) return Outcome.makeSuccess(await resizedInstance.png(toSharpPngOptions(options)).toBuffer())
  if (isFormatWebpOptions(options)) return Outcome.makeSuccess(await resizedInstance.webp(toSharpWebpOptions(options)).toBuffer())
  if (isFormatAvifOptions(options)) return Outcome.makeSuccess(await resizedInstance.avif(toSharpAvifOptions(options)).toBuffer())
  if (isFormatTiffOptions(options)) return Outcome.makeSuccess(await resizedInstance.tiff(toSharpTiffOptions(options)).toBuffer())
  if (isFormatHeifOptions(options)) return Outcome.makeSuccess(await resizedInstance.heif(toSharpHeifOptions(options)).toBuffer())
  return Outcome.makeSuccess(await resizedInstance.toBuffer())
}

/** Resizes an image to a specific width while maintaining aspect ratio. */
export const toWidth = async (input: ImageLike, width: number): Promise<Buffer> => (await toSharpInstance(input)).resize({ width }).toBuffer()
/** Resizes an image to a specific height while maintaining aspect ratio. */
export const toHeight = async (input: ImageLike, height: number): Promise<Buffer> => (await toSharpInstance(input)).resize({ height }).toBuffer()

/** Converts an image to JPEG format. */
export const toJpg = async (input: ImageLike, quality?: number): Promise<Buffer> => (await toSharpInstance(input)).jpeg({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
/** Converts an image to PNG format. */
export const toPng = async (input: ImageLike, quality?: number, compressionLevel?: FormatPngOptions['compressionLevel']): Promise<Buffer> => (await toSharpInstance(input)).png({ quality: clamp(quality ?? 100, 1, 100), compressionLevel }).toBuffer()
/** Converts an image to WebP format. */
export const toWebp = async (input: ImageLike, quality?: number): Promise<Buffer> => (await toSharpInstance(input)).webp({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
/** Converts an image to AVIF format. */
export const toAvif = async (input: ImageLike, quality?: number): Promise<Buffer> => (await toSharpInstance(input)).avif({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
/** Converts an image to TIFF format. */
export const toTiff = async (input: ImageLike, quality?: number, compression?: FormatTiffOptions['compression']): Promise<Buffer> => (await toSharpInstance(input)).tiff({ quality: clamp(quality ?? 100, 1, 100), compression }).toBuffer()
/** Converts an image to HEIF format. */
export const toHeif = async (input: ImageLike, quality?: number): Promise<Buffer> => (await toSharpInstance(input)).heif({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
